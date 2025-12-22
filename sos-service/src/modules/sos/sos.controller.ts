import { Request, Response } from 'express';
import { SOSService } from './sos.service';
import { StatusMachineService } from './statusMachine.service';
import { UserRole } from '../../middleware/roleGuard';
import { eventEmitter } from '../../services/eventEmitter';

export class SOSController {
  constructor(private sosService: SOSService, private statusMachine: StatusMachineService) {}

  /**
   * POST /sos
   * Create SOS (CITIZEN only)
   */
  async createSOS(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.CITIZEN) {
        res.status(403).json({ error: 'Only citizens can create SOS requests' });
        return;
      }

      const { type, message, silent } = req.validatedBody;
      const { id: citizenId, cityId } = req.user;

      const sos = await this.sosService.createSOS({
        type,
        message,
        silent: silent || false,
        citizenId,
        cityId,
        latitude: 0, // Will be updated with first location
        longitude: 0,
      });

      // Publish event
      eventEmitter.publishSOSEvent({
        type: 'SOS_CREATED',
        sosId: sos.id,
        cityId,
        timestamp: new Date(),
        data: {
          sosId: sos.id,
          citizenId,
          type,
          message,
          silent,
        },
      });

      res.status(201).json({
        sosId: sos.id,
        status: sos.status,
        createdAt: sos.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /sos/{sosId}
   * Get SOS Details (ADMIN only)
   */
  async getSOS(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only admins can view SOS details' });
        return;
      }

      const { sosId } = req.params;
      const { cityId } = req.user;

      const result = await this.sosService.getSOS(sosId, cityId);
      if (!result) {
        res.status(404).json({ error: 'SOS request not found' });
        return;
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * GET /sos
   * List Active SOS (ADMIN only)
   */
  async listSOS(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only admins can list SOS requests' });
        return;
      }

      const { cityId } = req.user;
      const { status } = req.query;

      let results;
      if (status) {
        results = await this.sosService.listByStatus(cityId, status as string);
      } else {
        results = await this.sosService.listSOS(cityId);
      }

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /sos/{sosId}/location
   * Update Citizen Location (CITIZEN only)
   */
  async updateLocation(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.CITIZEN) {
        res.status(403).json({ error: 'Only citizens can update location' });
        return;
      }

      const { sosId } = req.params;
      const { lat, lng, accuracy } = req.validatedBody;
      const { id: citizenId, cityId } = req.user;

      // Verify SOS ownership
      const sos = await this.sosService.getSOS(sosId, cityId);
      if (!sos) {
        res.status(404).json({ error: 'SOS request not found' });
        return;
      }

      if (sos.citizenId !== citizenId) {
        res.status(403).json({ error: 'Cannot update location of another citizen' });
        return;
      }

      const updated = await this.sosService.updateLocation(sosId, cityId, {
        lat,
        lng,
        accuracy,
      });

      // Publish event
      eventEmitter.publishSOSEvent({
        type: 'LOCATION_UPDATED',
        sosId,
        cityId,
        timestamp: new Date(),
        data: {
          sosId,
          lat,
          lng,
          accuracy,
        },
      });

      res.status(201).json({
        sosId: updated.id,
        location: updated.lastKnownLocation,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /sos/{sosId}/messages
   * Send Message (CITIZEN or ADMIN)
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || (req.user.role !== UserRole.CITIZEN && req.user.role !== UserRole.ADMIN)) {
        res.status(403).json({ error: 'Only citizens and admins can send messages' });
        return;
      }

      const { sosId } = req.params;
      const { content } = req.validatedBody;
      const { id: userId, role, cityId } = req.user;

      // Verify SOS exists
      const sos = await this.sosService.getSOS(sosId, cityId);
      if (!sos) {
        res.status(404).json({ error: 'SOS request not found' });
        return;
      }

      // Citizen can only message their own SOS
      if (role === UserRole.CITIZEN && sos.citizenId !== userId) {
        res.status(403).json({ error: 'Cannot message another citizen\'s SOS' });
        return;
      }

      const message = await this.sosService.sendMessage(sosId, cityId, {
        content,
        senderRole: role.toLowerCase(),
        senderId: userId,
      });

      // Publish event
      eventEmitter.publishSOSEvent({
        type: 'MESSAGE_SENT',
        sosId,
        cityId,
        timestamp: new Date(),
        data: {
          sosId,
          content,
          senderId: userId,
          senderRole: role,
        },
      });

      res.status(201).json({
        messageId: message.id,
        content: message.content,
        createdAt: message.createdAt,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /sos/{sosId}/cancel
   * Cancel SOS (CITIZEN only)
   */
  async cancelSOS(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.CITIZEN) {
        res.status(403).json({ error: 'Only citizens can cancel SOS' });
        return;
      }

      const { sosId } = req.params;
      const { id: citizenId, cityId } = req.user;

      // Verify SOS ownership
      const sos = await this.sosService.getSOS(sosId, cityId);
      if (!sos) {
        res.status(404).json({ error: 'SOS request not found' });
        return;
      }

      if (sos.citizenId !== citizenId) {
        res.status(403).json({ error: 'Cannot cancel another citizen\'s SOS' });
        return;
      }

      const cancelled = await this.statusMachine.cancelSOS(sosId, cityId);

      res.json({
        sosId: cancelled?.id,
        status: cancelled?.status,
      });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  /**
   * POST /sos/{sosId}/close
   * Close/Resolve SOS (ADMIN only)
   */
  async closeSOS(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ error: 'Only admins can close SOS requests' });
        return;
      }

      const { sosId } = req.params;
      const { resolutionNote } = req.validatedBody;
      const { cityId } = req.user;

      const closed = await this.statusMachine.closeSOS(sosId, cityId, resolutionNote);
      if (!closed) {
        res.status(404).json({ error: 'SOS request not found' });
        return;
      }

      res.json({
        sosId: closed.id,
        status: closed.status,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
