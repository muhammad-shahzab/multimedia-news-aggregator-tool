
 // Shuffles a single array randomly using Fisher-Yates algorithm

export function Mixer(items = []) {
  const arr = [...items]; // create a shallow copy to avoid mutating the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [arr[i], arr[j]] = [arr[j], arr[i]];           // swap
  }
  return arr;
}

// Example usage
/*
import { shuffleMixer } from './utils/shuffleMixer.js';

const combined = [...videos, ...articles];
const shuffledFeed = shuffleMixer(combined);
console.log(shuffledFeed);
*/
