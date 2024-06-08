/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { neynar } from 'frog/middlewares'

export const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
}).use(
  neynar({
    apiKey: 'NEYNAR_FROG_FM',
    features: ['interactor', 'cast'],
  }),
);

app.frame('/start', (c) => {
  return c.res({
    action: '/Join-Waitlist',
    image: "http://localhost:3000/Getstarted.jpg",
    intents: [
      <Button value="Join-waitlist">Join-waitlist</Button>,
    ],
  });
});

app.frame('/Join-Waitlist', (c) => {
  const interactor = c.var.interactor;
  const cast = c.var.cast;
  console.log('cast:', JSON.stringify(cast, null, 2)); // Output the entire cast object
  console.log('cast: ', c.var.cast)
  if (
    interactor &&
    interactor.viewerContext &&
    interactor.viewerContext.following 
  ) {
    return c.res({
      action: '/Done',
      image: "http://localhost:3000/Youhavejoined.jpg",
    });
  } else {
    return c.res({
      action: '/Join-Waitlist',
      image: "http://localhost:3000/Tryagain.jpg",
      intents: [
        <Button.Reset>Try-again</Button.Reset>,
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
  });
});

devtools(app, { serveStatic });

export const GET = handle(app);
export const POST = handle(app);
