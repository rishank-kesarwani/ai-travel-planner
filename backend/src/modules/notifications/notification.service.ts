import { Injectable, Logger } from '@nestjs/common';
import { NotificationClientService } from './notification-client.service';
import { IngestNotificationPayload } from './interfaces/notification.interface';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly client: NotificationClientService) {}

  /**
   * 1. Send Welcome Email & Push Notification when a new traveler registers
   */
  async sendWelcomeNotification(user: { id: string; email: string; name: string }): Promise<void> {
    const payload: IngestNotificationPayload = {
      idempotencyKey: `welcome_${user.id}_${Date.now()}`,
      priority: 'CRITICAL',
      channels: ['EMAIL', 'PUSH'],
      recipient: {
        userId: user.id,
        email: user.email,
        pushToken: `push_token_${user.id}`,
      },
      email: {
        subject: `✈️ Welcome to NomadAI, ${user.name}! Your AI Travel Journey Begins`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #2dd4bf; margin: 0; font-size: 26px;">NomadAI Travel Intelligence</h1>
              <p style="color: #94a3b8; font-size: 14px; margin-top: 6px;">Next-Gen Autonomous Itinerary Orchestration</p>
            </div>
            <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h2 style="font-size: 18px; color: #ffffff; margin-top: 0;">Welcome aboard, ${user.name}! 🌟</h2>
              <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                Your account is ready. You can now generate multi-day personalized itineraries with <strong>LangGraph state workflows</strong>, search curated global destinations, and converse with your streaming travel assistant.
              </p>
            </div>
            <div style="text-align: center;">
              <a href="http://localhost:3000/plan-trip" style="display: inline-block; background: linear-gradient(135deg, #14b8a6, #06b6d4); color: #020617; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px;">
                Plan Your First AI Trip 🚀
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #334155; margin: 28px 0 16px;" />
            <p style="color: #64748b; font-size: 11px; text-align: center;">NomadAI Flagship Portfolio • Powered by Notification Engine Service</p>
          </div>
        `,
      },
      push: {
        title: `Welcome to NomadAI! 🌍`,
        body: `Hi ${user.name}, your travel assistant is ready. Tap to plan your next journey!`,
      },
      metadata: {
        event: 'USER_WELCOME',
        userId: user.id,
      },
    };

    await this.client.sendNotification(payload);
  }

  /**
   * 2. Send Itinerary Confirmation Notification (Email + Push) when a trip is created or booked
   */
  async sendTripCreatedNotification(
    user: { id: string; email: string; name: string },
    trip: {
      _id: string;
      destination: string;
      startDate: string;
      endDate: string;
      numberOfDays: number;
      budget: number;
      itinerary?: any[];
    },
  ): Promise<void> {
    const daysSummary = (trip.itinerary || [])
      .slice(0, 3)
      .map((d: any) => `<li style="margin-bottom: 6px; color: #cbd5e1;"><strong>Day ${d.day}</strong>: ${d.theme}</li>`)
      .join('');

    const payload: IngestNotificationPayload = {
      idempotencyKey: `trip_created_${trip._id}`,
      priority: 'CRITICAL',
      channels: ['EMAIL', 'PUSH'],
      recipient: {
        userId: user.id,
        email: user.email,
        pushToken: `push_token_${user.id}`,
      },
      email: {
        subject: `🗺️ Your ${trip.numberOfDays}-Day Itinerary for ${trip.destination} is Confirmed!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; padding: 32px; border: 1px solid #1e293b;">
            <h1 style="color: #2dd4bf; font-size: 24px; margin-top: 0;">Journey to ${trip.destination} 🎒</h1>
            <p style="color: #94a3b8; font-size: 14px;">Travel Dates: <strong>${trip.startDate}</strong> to <strong>${trip.endDate}</strong> (${trip.numberOfDays} Days)</p>
            
            <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #ffffff; margin-top: 0; font-size: 16px;">Itinerary Highlights</h3>
              <ul style="padding-left: 20px; font-size: 13px;">
                ${daysSummary || '<li>Custom AI curated day plans and activities</li>'}
              </ul>
              <div style="margin-top: 14px; font-size: 13px; color: #2dd4bf;">
                <strong>Estimated Budget:</strong> $${trip.budget} USD
              </div>
            </div>

            <div style="text-align: center; margin-top: 24px;">
              <a href="http://localhost:3000/trips/${trip._id}" style="display: inline-block; background: #2dd4bf; color: #020617; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-size: 14px;">
                Open Interactive Timeline
              </a>
            </div>
          </div>
        `,
      },
      push: {
        title: `Trip to ${trip.destination} Saved! 🌴`,
        body: `${trip.numberOfDays} days planned starting ${trip.startDate}. Budget: $${trip.budget}`,
      },
      metadata: {
        event: 'TRIP_CREATED',
        tripId: trip._id,
        destination: trip.destination,
      },
    };

    await this.client.sendNotification(payload);
  }

  /**
   * 3. Send Trip Status Updated Notification (Push + Email)
   */
  async sendTripStatusUpdatedNotification(
    user: { id: string; email: string; name: string },
    trip: { _id: string; destination: string },
    newStatus: string,
  ): Promise<void> {
    const payload: IngestNotificationPayload = {
      idempotencyKey: `trip_status_${trip._id}_${newStatus}_${Date.now()}`,
      priority: 'CRITICAL',
      channels: ['PUSH', 'EMAIL'],
      recipient: {
        userId: user.id,
        email: user.email,
        pushToken: `push_token_${user.id}`,
      },
      email: {
        subject: `Trip Update: ${trip.destination} Status is now ${newStatus.toUpperCase()}`,
        html: `
          <div style="font-family: sans-serif; background-color: #0f172a; color: #fff; padding: 24px; border-radius: 12px;">
            <h2 style="color: #2dd4bf;">Trip Status Update</h2>
            <p>Your journey to <strong>${trip.destination}</strong> has been updated to <strong>${newStatus.toUpperCase()}</strong>.</p>
            <p><a href="http://localhost:3000/trips/${trip._id}" style="color: #2dd4bf;">View Trip Details</a></p>
          </div>
        `,
      },
      push: {
        title: `Trip Status: ${trip.destination}`,
        body: `Your trip status is now ${newStatus.toUpperCase()}.`,
      },
      metadata: {
        event: 'TRIP_STATUS_UPDATED',
        tripId: trip._id,
        status: newStatus,
      },
    };

    await this.client.sendNotification(payload);
  }
}
