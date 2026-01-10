import { identityClient } from '../../services/identity.client';
import { eventBus, SOS_EVENTS, type SOSCreatedEvent, type SOSStatusChangedEvent } from '../events';
import { SOSService } from '../sos/sos.service';
import { SYSTEM_MESSAGES } from './message.constant';
import { MessageService } from './message.service';

/**
 * Event handlers for SOS-related events
 * This module listens to SOS events and performs corresponding messaging actions
 */
export class SOSEventHandlers {
  constructor(
    private messageService: MessageService,
    private sosService: SOSService
) {
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    // Handle new SOS creation
    eventBus.on(SOS_EVENTS.CREATED, async (event) => {
      await this.handleSOSCreated(event.data as unknown as SOSCreatedEvent);
    });

    // Handle SOS status changes
    eventBus.on(SOS_EVENTS.STATUS_CHANGED, async (event) => {
      await this.handleSOSStatusChanged(event.data as unknown as SOSStatusChangedEvent);
    });
  }

  /**
   * Send welcome message when SOS is created
   */
  private async handleSOSCreated(data: SOSCreatedEvent): Promise<void> {
    try {
        const content = SYSTEM_MESSAGES.SOS_CREATED.content({ sosId: data.sosId });
        console.log('Sending SOS creation message for SOS ID:', data.sosId);
        await this.messageService.sendMessage({
            sosId: data.sosId,
            content: content,
            senderType: 'SYSTEM',
            senderDisplayName: 'System',
            contentType: 'text',
            senderId: null,
            options:{
                intendedFor: 'CITIZEN',
            }
        });
        
        const sharePhoneNumberConsentMessage = SYSTEM_MESSAGES.SHARE_PHONE_NUMBER_CONSENT;
        // delay to ensure message order
        await new Promise(resolve => setTimeout(resolve, 1400));
        await this.messageService.sendMessage({
            sosId: data.sosId,
            content: sharePhoneNumberConsentMessage.content,
            senderType: 'SYSTEM',
            senderDisplayName: 'System',
            contentType: sharePhoneNumberConsentMessage.contentType,
            senderId: null,
            options: sharePhoneNumberConsentMessage.options,
        });

        // send message to admins as well
        const sosDetail = await this.sosService.getSOS(data.sosId);
        const citizenPersonalInfo = await identityClient.getCitizenInfo(sosDetail?.citizenId || '');
        console.log('Citizen Info:', citizenPersonalInfo);
        const adminContent = [
        '🚨 New SOS created.',
        '',
        `🆔 SOS ID: ${data.sosId}`,
        '',
        `👤 Citizen: ${citizenPersonalInfo?.displayName || 'Unknown'} (${sosDetail?.citizenId || 'N/A'})`,
        '',
        'Please respond promptly.'
        ].join('\n');
        
        await this.messageService.sendMessage({
            sosId: data.sosId,
            content: adminContent,
            senderType: 'SYSTEM',
            senderDisplayName: 'System',
            contentType: 'text',
            senderId: null,
            options:{
                intendedFor: 'SOS_ADMIN'          
            }
        });
    }
    catch (error) {
      console.error('Failed to send SOS creation message:', error);
    }
  }

  /**
   * Send status update message when SOS status changes
   */
  private async handleSOSStatusChanged(data: SOSStatusChangedEvent): Promise<void> {
    try {
      let message = '';
      
      switch (data.newStatus) {
        case 'EN_ROUTE':
          message = '🚗 Rescue team is on their way to your location.';
          break;
        case 'ARRIVED':
          message = '✅ Rescue team has arrived at your location.';
          break;
        case 'COMPLETED':
          message = '✨ Your SOS has been completed. Thank you for using our service.';
          break;
        case 'CANCELLED':
          message = '❌ Your SOS has been cancelled.';
          break;
        default:
          return; // Don't send message for other statuses
      }

      await this.messageService.sendMessage({
        sosId: data.sosId,
        content: message,
        senderType: 'SYSTEM',
        senderDisplayName: 'System',
        contentType: 'text',
        senderId: null,
      });
    } catch (error) {
      console.error('Failed to send status update message:', error);
    }
  }
}
