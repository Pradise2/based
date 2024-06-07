/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { neynar } from 'frog/hubs'
import dotenv from 'dotenv';

dotenv.config();

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  hub: neynar({ 
    apikey: process.env.NEYNAR_API_KEY
  })
})


const fid = 3; // Viewer fid to check
const postUrl = process.env.POST_URL; // Replace with the actual post URL to check

// Function to check if a user is following the author of the post using Neynar
async function checkFollowingPostAuthor(fid: number, postUrl: string): Promise<boolean> {
  const options = {
    method: 'GET',
    headers: { accept: 'application/json', api_key: process.env.NEYNAR_API_KEY }
  };
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/cast?type=${postUrl}&viewer_fid=${fid}`, options);
    const data = await response.json();
    return data.cast.viewer_context.following;
  } catch (error) {
    console.error('Error checking following status:', error);
    return false;
  }
}

// Function to check if a user has liked and cast on a post using Neynar
async function checkPostInteractions(fid: number, postUrl: string): Promise<boolean> {
  const options = {
    method: 'GET',
    headers: { accept: 'application/json', api_key: process.env.NEYNAR_API_KEY }
  };
  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/cast?type=${postUrl}&viewer_fid=${fid}`, options);
    const data = await response.json();
    return data.cast.viewer_context.liked && data.cast.viewer_context.recasted;
  } catch (error) {
    console.error('Error checking post interactions:', error);
    return false;
  }
}

// Uncomment to use Edge Runtime
// export const runtime = 'edge'

app.frame('/start', (c) => {
  return c.res({
    action: '/Join-Waitlist',
    image: "http://localhost:3000/Getstarted.jpg",
    intents: [
      <Button value="Join-waitlist">Join-waitlist</Button>,
    ],
  })
})

app.frame('/Join-Waitlist', async (c) => {
  const isFollowing = await checkFollowingPostAuthor(fid, postUrl);
  const hasLikedAndCast = await checkPostInteractions(fid, postUrl);

  if (isFollowing && hasLikedAndCast) {
    return c.res({
      action: '/Done',
      image: "http://localhost:3000/Youhavejoined.jpg", 
    });
  } else {
    return c.res({
      action: '/Join-Waitlist',
      image: "http://localhost:3000/Tryagain.jpg",
      intents: [
        <Button.Reset >Try-again</Button.Reset>,
        <Button.Link href="https://warpcast.com/based-launch">Follow /basedlaunch</Button.Link>,
        <Button.Link href="https://warpcast.com/~/channel/basedlaunch">Follow @based-launch</Button.Link>,
      ],
    });
  }
});

app.frame('/Done', (c) => {
  return c.res({
    image: "http://localhost:3000/Youhavejoined.jpg",
    intents: [
      <Button value="Share">Share</Button>,
    ],
  })
})

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
