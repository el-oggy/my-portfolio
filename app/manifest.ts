import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Adarsh Swarup Maharana — Portfolio',
    short_name: 'Adarsh',
    description: 'Immersive portfolio of Adarsh Swarup Maharana — embedded systems, IoT, and electronics engineer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#fbf9f5',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
