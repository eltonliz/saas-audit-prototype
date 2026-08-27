/**
 * 通讯录域 — 纯直播 Store（本期范围：开播/观看/弹幕/点赞，无任何营销）
 */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { ImLiveRoom } from '../contracts/schemas/im-schemas';

export const useImLiveStore = defineStore('imLive', () => {
  const rooms = ref<ImLiveRoom[]>([]);

  function startRoom(roomId: string, hostId: string, groupId: string, storeId: string): ImLiveRoom {
    const existing = rooms.value.find((r) => r.room_id === roomId);
    if (existing) return existing;
    const room: ImLiveRoom = { room_id: roomId, host_id: hostId, store_id: storeId, status: 'living', viewer_count: 1 };
    rooms.value.push(room);
    return room;
  }

  function getRoom(roomId: string): ImLiveRoom | undefined {
    return rooms.value.find((r) => r.room_id === roomId);
  }

  function endRoom(roomId: string) {
    const r = getRoom(roomId);
    if (r) r.status = 'ended';
  }

  function addViewer(roomId: string) {
    const r = getRoom(roomId);
    if (r) r.viewer_count += 1;
  }

  return { rooms, startRoom, getRoom, endRoom, addViewer };
});
