const STORAGE_KEY = "nexus_memory";

// 🧠 Get full memory object
export function getMemory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// 💾 Save full memory object
export function setMemory(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// ➕ Add or update a key
export function updateMemory(key, value) {
  const memory = getMemory();
  memory[key] = value;
  setMemory(memory);
}

// 🔍 Get single value
export function getMemoryItem(key) {
  const memory = getMemory();
  return memory[key];
}

// ❌ Clear all memory
export function clearMemory() {
  localStorage.removeItem(STORAGE_KEY);
}