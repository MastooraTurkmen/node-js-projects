import { join, dirname } from 'node:path'
import { fileURLToPath,  } from 'node:url';

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, '../')
const audioDirectory = join(root, 'audio')
const publicDirectory = join(root, 'public')
const songsDirectory = join(audioDirectory, 'songs')

export default {
  dir: {
    root,
    publicDirectory,
    audioDirectory,
    songsDirectory,
    fxDirectory: join(audioDirectory, 'fx'),
  },
  pages: {
    homeHTML: 'home/index.html',
    controllerHTML: 'controller/index.html',
  },
  location: {
    home: '/home'
  },
  port: process.env.PORT || 3000,
  constants: {
    CONTENT_TYPES: {
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.html': 'text/html'
    },
    audioMediaType: 'mp3',
    fxVolume: '0.05',
    songVolume: '0.99',
    bitRateDivisor: 8,
    englishConversation: join(songsDirectory, 'conversation.mp3')
  }
}