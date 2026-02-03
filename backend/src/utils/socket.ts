import { io } from '../index';

// Event emission utilities for real-time features
export class SocketEmitter {
  // Price updates
  static emitPriceUpdate(assetId: string, price: number, change: number, changePercent: number) {
    io.to('price-updates').emit('price-update', {
      assetId,
      price,
      change,
      changePercent,
      timestamp: new Date().toISOString()
    });
  }

  // Notifications
  static emitNotification(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  static emitBroadcastNotification(notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    targetRoles?: string[];
    targetTenants?: string[];
    data?: any;
  }) {
    const targetRooms: string[] = [];

    if (notification.targetRoles) {
      targetRooms.push(...notification.targetRoles.map(role => `role:${role}`));
    }

    if (notification.targetTenants) {
      targetRooms.push(...notification.targetTenants.map(tenantId => `tenant:${tenantId}`));
    }

    if (targetRooms.length === 0) {
      // Broadcast to all connected users
      io.emit('notification', {
        ...notification,
        timestamp: new Date().toISOString()
      });
    } else {
      targetRooms.forEach(room => {
        io.to(room).emit('notification', {
          ...notification,
          timestamp: new Date().toISOString()
        });
      });
    }
  }

  // Governance proposals
  static emitGovernanceUpdate(proposalId: string, update: {
    type: 'created' | 'updated' | 'voted' | 'executed' | 'cancelled';
    proposal: any;
    voterId?: string;
    vote?: any;
  }) {
    io.to('governance').emit('governance-update', {
      proposalId,
      ...update,
      timestamp: new Date().toISOString()
    });
  }

  // Marketplace activity
  static emitMarketplaceActivity(activity: {
    type: 'listing_created' | 'listing_updated' | 'listing_deleted' | 'purchase' | 'bid' | 'offer';
    listingId: string;
    userId: string;
    data: any;
  }) {
    io.to('marketplace').emit('marketplace-activity', {
      ...activity,
      timestamp: new Date().toISOString()
    });
  }

  // Dashboard updates
  static emitDashboardUpdate(userId: string, updateType: string, data: any) {
    io.to(`user:${userId}`).emit('dashboard-update', {
      type: updateType,
      data,
      timestamp: new Date().toISOString()
    });
  }

  // Generic room-based emission
  static emitToRoom(room: string, event: string, data: any) {
    io.to(room).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // User-specific emission
  static emitToUser(userId: string, event: string, data: any) {
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Role-based emission
  static emitToRole(role: string, event: string, data: any) {
    io.to(`role:${role}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Tenant-based emission
  static emitToTenant(tenantId: string, event: string, data: any) {
    io.to(`tenant:${tenantId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}