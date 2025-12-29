import { Request, Response } from 'express';
import { IncidentTimelineEntity } from '../../types';
import { incidentTimelineService } from './incident-timeline.service';
import { getErrorResponse } from '../../errors';
import { createLogger } from '../../utils/logger';

const logger = createLogger('IncidentTimelineController');

/**
 * Incident Timeline Controller - HTTP request handler
 */
export class IncidentTimelineController {
  /**
   * POST /incident-timelines
   * Create a new timeline event
   */
  async createTimelineEvent(req: Request, res: Response): Promise<void> {
    try {
      const timelineData: IncidentTimelineEntity = {
        incidentId: req.body.incidentId,
        eventType: req.body.eventType,
        actor: req.body.actor,
        payload: req.body.payload,
      };

      const timeline =
        await incidentTimelineService.createTimelineEvent(timelineData);

      res.status(201).json({
        success: true,
        data: timeline,
        message: 'Timeline event created successfully',
      });
    } catch (error) {
      logger.error('Error in createTimelineEvent', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incident-timelines/:incidentId
   * Get timeline events by incident ID
   */
  async getTimelineByIncidentId(req: Request, res: Response): Promise<void> {
    try {
      const { incidentId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const timeline =
        await incidentTimelineService.getTimelineByIncidentId(
          incidentId,
          limit,
          skip
        );

      res.status(200).json({
        success: true,
        data: timeline,
        message: 'Timeline events retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getTimelineByIncidentId', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incident-timelines/:timelineId/event
   * Get timeline event by ID
   */
  async getTimelineEventById(req: Request, res: Response): Promise<void> {
    try {
      const { timelineId } = req.params;

      const timeline =
        await incidentTimelineService.getTimelineEventById(timelineId);

      res.status(200).json({
        success: true,
        data: timeline,
        message: 'Timeline event retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getTimelineEventById', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incident-timelines/:incidentId/events
   * Get timeline events filtered by event type
   */
  async getTimelineByIncidentIdAndEventType(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { incidentId } = req.params;
      const { eventType } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      if (!eventType) {
        res.status(400).json({
          success: false,
          message: 'eventType query parameter is required',
        });
        return;
      }

      const timeline =
        await incidentTimelineService.getTimelineByIncidentIdAndEventType(
          incidentId,
          eventType as any,
          limit,
          skip
        );

      res.status(200).json({
        success: true,
        data: timeline,
        message: 'Filtered timeline events retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getTimelineByIncidentIdAndEventType', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incident-timelines/actor/:actorId
   * Get timeline events by actor ID
   */
  async getTimelineByActorId(req: Request, res: Response): Promise<void> {
    try {
      const { actorId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const skip = req.query.skip ? parseInt(req.query.skip as string) : 0;

      const timeline = await incidentTimelineService.getTimelineByActorId(
        actorId,
        limit,
        skip
      );

      res.status(200).json({
        success: true,
        data: timeline,
        message: 'Actor timeline events retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getTimelineByActorId', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  /**
   * GET /incident-timelines/:incidentId/count
   * Get timeline event count for an incident
   */
  async getTimelineEventCountByIncidentId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { incidentId } = req.params;

      const count =
        await incidentTimelineService.getTimelineEventCountByIncidentId(
          incidentId
        );

      res.status(200).json({
        success: true,
        data: { incidentId, count },
        message: 'Timeline event count retrieved successfully',
      });
    } catch (error) {
      logger.error('Error in getTimelineEventCountByIncidentId', error);
      const errorResponse = getErrorResponse(error);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}

export const incidentTimelineController = new IncidentTimelineController();
