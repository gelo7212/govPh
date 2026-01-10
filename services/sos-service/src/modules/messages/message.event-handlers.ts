import { eventBus, MESSAGE_EVENTS, type MessageResponseReceivedEvent } from '../events';
import { SYSTEM_MESSAGES } from './message.constant';
import { MessageService } from './message.service';

/**
 * Event handlers for Message-related events
 * This module listens to message events and performs corresponding actions
 */
export class MessageEventHandlers {
  constructor(private messageService: MessageService) {
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    console.log('Initializing Message Event Handlers');
    // Handle message responses (when citizen answers a prompt)
    eventBus.on(MESSAGE_EVENTS.RESPONSE_RECEIVED, async (event) => {
        console.log('Received MESSAGE_EVENTS.RESPONSE_RECEIVED event');
        await this.handleMessageResponseReceived(event.data as unknown as MessageResponseReceivedEvent);
    });
  }

  /**
   * Handle when a message response is received (e.g., citizen answering a prompt)
   */
  private async handleMessageResponseReceived(
    data: MessageResponseReceivedEvent
  ): Promise<void> {
    try {
      console.log(`Processing message response for SOS ${data.sosId}`);
      console.log(`Prompt Key: ${data.answerTo.promptKey}, Action: ${data.answerTo.action}`);

      // Handle different prompt types
      switch (data.answerTo.promptKey) {
        case 'SHARE_PHONE_NUMBER':
          await this.handlePhoneNumberResponse(data);
          break;
        // Add more prompt handlers as needed
        default:
          console.log(`No specific handler for prompt: ${data.answerTo.promptKey}`);
      }
    } catch (error) {
      console.error('Failed to process message response:', error);
    }
  }

  /**
   * Handle phone number sharing response
   */
  private async handlePhoneNumberResponse(
    data: MessageResponseReceivedEvent
  ): Promise<void> {
    try {
      console.log(
        `Phone number shared by ${data.senderDisplayName} (${data.senderId}): ${data.content}`
      );
        if (data.answerTo.action === 'SHARE_SAVED') {
            console.log(
            `Phone number has been saved for SOS: ${data.sosId}`
            );

            await this.messageService.sendMessage({
                sosId: data.sosId,
                content: 'Thank you for sharing your phone number. Our responders may contact you if needed.', 
                senderType: 'SYSTEM',
                senderDisplayName: 'System',
                contentType: 'text',
                senderId: null,
                options:{
                    intendedFor: 'CITIZEN',
                }
            });
        
        } 
        if(data.answerTo.action === 'CANCEL') {
            console.log(
            `Citizen cancelled phone number sharing for SOS: ${data.sosId}`
            );
            const content = [
                'You have chosen not to share your phone number. If you change your mind, please let us know.',
                '',
                'You can also type your phone number manually in the chat if you prefer.'
            ]
            await this.messageService.sendMessage({
                sosId: data.sosId,
                content: content.join('\n'),
                senderType: 'SYSTEM',
                senderDisplayName: 'System',
                contentType: 'text',
                senderId: null,
                options:{
                    intendedFor: 'CITIZEN',
                }
            });
        
        } 

        // delay before sending next prompt, without blocking the event loop

        await new Promise(resolve => setTimeout(resolve, 1400));
        const areYouInDangerAction = SYSTEM_MESSAGES.CITIZEN_URGENCY_CHECK;
        await this.messageService.sendMessage({
            sosId: data.sosId,
            content: areYouInDangerAction.content,
            senderType: 'SYSTEM',
            senderDisplayName: 'System',
            contentType: areYouInDangerAction.contentType,
            senderId: null,
            options: areYouInDangerAction.options,
        });
    } catch (error) {
      console.error('Failed to handle phone number response:', error);
    }
  }
}
