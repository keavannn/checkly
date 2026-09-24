import { useSyncExternalStore } from "react";
import { type DemoConfig } from "./config";

/* ---------- Chat réception ↔ chambre ---------- */

export type ChatMessage = { id: number; room: number; guest: string; from: "client" | "reception"; text: string; timestamp: number };

const CHAT_KEY = "checkly_chat";
const chatListeners = new Set<() => void>();
function notifyChat() { chatListeners.forEach((l) => l()); }

export function readChatMessages(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeChatMessages(messages: ChatMessage[]) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  notifyChat();
}

export function sendChatMessage(room: number, guest: string, from: "client" | "reception", text: string): ChatMessage {
  const message: ChatMessage = { id: Date.now() + Math.random(), room, guest, from, text, timestamp: Date.now() };
  writeChatMessages([...readChatMessages(), message]);
  return message;
}

/** Génère quelques conversations fictives sur des chambres différentes, pour voir le rendu du dashboard avec plusieurs chats en même temps. */
export function seedDemoChats(config: DemoConfig) {
  const now = Date.now();
  const conversations: { room: number; guest: string; exchanges: [string, string][] }[] = [
    { room: config.room + 2, guest: "Sophie Martin", exchanges: [
      ["Bonjour, est-ce que le petit-déjeuner est servi jusqu'à quelle heure ?", "Bonjour ! Le petit-déjeuner est servi jusqu'à 10h30 en salle."],
    ] },
    { room: config.room + 5, guest: "James Cooper", exchanges: [
      ["Hi, could I get an extra pillow please?", "Of course, we'll bring one right away."],
      ["Thank you!", "You're welcome, enjoy your stay 🙏"],
    ] },
    { room: config.room - 3, guest: "Elena Rossi", exchanges: [
      ["Bonsoir, le spa est-il ouvert ce soir ?", "Bonsoir, le spa ferme à 20h, il vous reste un peu de temps !"],
    ] },
    { room: config.room + 8, guest: "Marco Keller", exchanges: [
      ["La climatisation ne fonctionne pas dans la chambre.", "Nous envoyons quelqu'un immédiatement, désolé pour la gêne."],
      ["Merci beaucoup", ""],
    ] },
  ];
  const newMessages: ChatMessage[] = [];
  conversations.forEach(({ room, guest, exchanges }, convIndex) => {
    let t = now - (conversations.length - convIndex) * 40 * 60 * 1000;
    exchanges.forEach(([clientText, receptionText]) => {
      newMessages.push({ id: t, room, guest, from: "client", text: clientText, timestamp: t });
      t += 60 * 1000;
      if (receptionText) {
        newMessages.push({ id: t + 0.5, room, guest, from: "reception", text: receptionText, timestamp: t });
        t += 5 * 60 * 1000;
      }
    });
  });
  writeChatMessages([...readChatMessages(), ...newMessages]);
}

export function clearRoomChat(room: number) {
  writeChatMessages(readChatMessages().filter((m) => m.room !== room));
}

export function clearChats() {
  writeChatMessages([]);
}

let cachedChatRaw: string | null = null;
let cachedChatSnapshot: ChatMessage[] = [];
function getChatSnapshot(): ChatMessage[] {
  const raw = localStorage.getItem(CHAT_KEY);
  if (raw !== cachedChatRaw) {
    cachedChatRaw = raw;
    try {
      cachedChatSnapshot = raw ? JSON.parse(raw) : [];
    } catch {
      cachedChatSnapshot = [];
    }
  }
  return cachedChatSnapshot;
}
const emptyChat: ChatMessage[] = [];
function getChatServerSnapshot(): ChatMessage[] {
  return emptyChat;
}
function subscribeChat(callback: () => void) {
  chatListeners.add(callback);
  const onStorage = (e: StorageEvent) => { if (e.key === CHAT_KEY) callback(); };
  window.addEventListener("storage", onStorage);
  return () => { chatListeners.delete(callback); window.removeEventListener("storage", onStorage); };
}

export function useChatMessages(): ChatMessage[] {
  return useSyncExternalStore(subscribeChat, getChatSnapshot, getChatServerSnapshot);
}

export type RoomConversation = { room: number; guest: string; messages: ChatMessage[]; lastTimestamp: number; lastFrom: "client" | "reception" };

export function getRoomConversations(messages: ChatMessage[]): RoomConversation[] {
  const map = new Map<number, ChatMessage[]>();
  messages.forEach((m) => {
    if (!map.has(m.room)) map.set(m.room, []);
    map.get(m.room)!.push(m);
  });
  return [...map.entries()]
    .map(([room, msgs]) => {
      const sorted = [...msgs].sort((a, b) => a.timestamp - b.timestamp);
      const last = sorted[sorted.length - 1];
      return { room, guest: last.guest, messages: sorted, lastTimestamp: last.timestamp, lastFrom: last.from };
    })
    .sort((a, b) => b.lastTimestamp - a.lastTimestamp);
}
