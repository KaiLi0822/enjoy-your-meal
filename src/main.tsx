import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Blog from './blog/Blog.tsx'

const isDev = import.meta.env.MODE === 'development';

createRoot(document.getElementById('root')!).render(
  isDev ? (
    <StrictMode>
      <Blog />
    </StrictMode>
  ) : (
    <Blog />
  )

)
