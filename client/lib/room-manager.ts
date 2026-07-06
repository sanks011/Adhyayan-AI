/**
 * Room Management Utilities
 * 
 * This file contains utilities for managing quiz rooms, including:
 * - Automatic cleanup of inactive/completed rooms
 * - Participant activity tracking
 * - Room deletion logic
 */

import { db } from './firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

export class RoomManager {
  /**
   * Schedule periodic cleanup of rooms
   * This should be called when the application starts
   */
  static startCleanupSchedule() {
    // Run cleanup every 2 minutes for more responsive auto-deletion
    setInterval(async () => {
      try {
        await this.performCleanup();
      } catch (error) {
        console.error('Cleanup error in scheduled job:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes
  }

  /**
   * Manually trigger room cleanup
   */
  static async triggerCleanup() {
    try {
      return await this.performCleanup();
    } catch (error) {
      console.error('Manual cleanup error:', error);
      throw error;
    }
  }

  /**
   * Internal method to query and delete completed/stale rooms from Firestore
   */
  private static async performCleanup() {
    console.log('Running room cleanup...');
    const roomsCollection = collection(db, 'quiz-rooms');
    const querySnapshot = await getDocs(roomsCollection);
    
    let deletedCount = 0;
    const now = Date.now();
    const fourHoursAgo = now - (4 * 60 * 60 * 1000); // 4 hours in milliseconds
    
    for (const roomDoc of querySnapshot.docs) {
      const roomData = roomDoc.data();
      const createdAtTimestamp = roomData.createdAt;
      const createdAt = createdAtTimestamp?.toDate ? createdAtTimestamp.toDate().getTime() : 0;
      const isCompleted = roomData.status === 'completed';
      const isStale = createdAt > 0 && createdAt < fourHoursAgo;
      
      if (isCompleted || isStale) {
        console.log(`Cleaning up room: ${roomDoc.id} (Completed: ${isCompleted}, Stale: ${isStale})`);
        await deleteDoc(doc(db, 'quiz-rooms', roomDoc.id));
        deletedCount++;
      }
    }
    
    console.log(`Room cleanup completed. Deleted ${deletedCount} rooms.`);
    return { success: true, deletedCount };
  }
}

// Auto-start cleanup schedule in browser environment
if (typeof window !== 'undefined') {
  // Only start if not already started
  if (!(window as any).__roomCleanupStarted) {
    RoomManager.startCleanupSchedule();
    (window as any).__roomCleanupStarted = true;
  }
}
