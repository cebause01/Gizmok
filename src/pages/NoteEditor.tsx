import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Save, PenTool, Type, Eraser, Trash2, Maximize2, Minimize2,
  Undo2, Redo2, Circle, Square, Minus, ArrowRight, Image as ImageIcon, 
  MousePointer2, Bookmark, Share2, Search, Grid
} from 'lucide-react'
import { storage, Note } from '../utils/storage'
import './NoteEditor.css'

type Tool = 'pen' | 'text' | 'eraser' | 'highlighter' | 'shape' | 'lasso' | 'image'
type ShapeType = 'circle' | 'rectangle' | 'line' | 'arrow' | null

interface CanvasImage {
  id: string
  dataUrl: string
  x: number
  y: number
  width: number
  height: number
  originalWidth: number
  originalHeight: number
}

const COLOR_PRESETS = [
  { name: 'Black', color: '#000000' },
  { name: 'Blue', color: '#2563eb' },
  { name: 'Red', color: '#dc2626' },
  { name: 'Yellow', color: '#fbbf24' },
  { name: 'Green', color: '#16a34a' },
  { name: 'Purple', color: '#9333ea' },
  { name: 'Orange', color: '#ea580c' },
  { name: 'Pink', color: '#db2777' },
]

export default function NoteEditor() {
  const { noteId } = useParams<{ noteId: string }>()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [note, setNote] = useState<Note | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [template, setTemplate] = useState<'blank' | 'lined' | 'grid' | 'dotted' | 'cornell' | 'music' | 'graph-small' | 'graph-large' | 'todo' | 'wide-ruled' | 'narrow-ruled'>('blank')
  const [activeTool, setActiveTool] = useState<Tool>('pen')
  const [penColor, setPenColor] = useState('#000000')
  const [penWidth, setPenWidth] = useState(3)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 })
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [shapeType, setShapeType] = useState<ShapeType>(null)
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null)
  const [_history, setHistory] = useState<string[]>([])
  const [_historyIndex, setHistoryIndex] = useState(-1)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [images, setImages] = useState<CanvasImage[]>([])
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [isMovingImage, setIsMovingImage] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null)
  const historyRef = useRef<string[]>([])
  const historyIndexRef = useRef(-1)

  useEffect(() => {
    if (noteId) {
      const existingNote = storage.getNote(noteId)
      if (existingNote) {
        setNote(existingNote)
        setTitle(existingNote.title)
        setContent(existingNote.content)
        setTemplate(existingNote.template)
        setIsBookmarked(existingNote.isBookmarked || false)
      }
    }
  }, [noteId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Wait for canvas to be properly sized
    let retries = 0
    const maxRetries = 20
    const initCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if ((rect.width === 0 || rect.height === 0) && retries < maxRetries) {
        // Canvas not sized yet, retry after a short delay
        retries++
        setTimeout(initCanvas, 50)
        return
      }
      
      // If canvas still has no size after max retries, use default size
      const width = rect.width || 800
      const height = rect.height || 600

      // Set canvas size
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.scale(dpr, dpr)
      
      // Set drawing styles
      ctx.strokeStyle = penColor
      ctx.lineWidth = penWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      
      // Enable pressure simulation for smoother drawing
      ctx.globalAlpha = activeTool === 'highlighter' ? 0.4 : 1.0

      // Draw template background
      drawTemplate(ctx, width, height)

      // Load existing handwriting if editing
      if (note?.handwriting) {
        const img = new Image()
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          // Draw images on top if any
          if (images.length > 0) {
            drawAllImagesDirectly(ctx, width, height)
          }
          // Initialize history with current canvas state
          setTimeout(() => {
            const dataUrl = canvas.toDataURL()
            historyRef.current = [dataUrl]
            historyIndexRef.current = 0
            setHistory([dataUrl])
            setHistoryIndex(0)
          }, 100)
        }
        img.onerror = () => {
          // If image fails to load, just initialize with blank canvas
          if (images.length > 0) {
            drawAllImagesDirectly(ctx, width, height)
          }
          setTimeout(() => {
            const dataUrl = canvas.toDataURL()
            historyRef.current = [dataUrl]
            historyIndexRef.current = 0
            setHistory([dataUrl])
            setHistoryIndex(0)
          }, 100)
        }
        img.src = note.handwriting
      } else {
        // New note - draw images if any, then initialize history
        if (images.length > 0) {
          drawAllImagesDirectly(ctx, width, height)
        }
        // Initialize history with blank canvas
        setTimeout(() => {
          const dataUrl = canvas.toDataURL()
          historyRef.current = [dataUrl]
          historyIndexRef.current = 0
          setHistory([dataUrl])
          setHistoryIndex(0)
        }, 100)
      }
    }

    // Use a slight delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(initCanvas, 50)
    return () => clearTimeout(timeoutId)
  }, [template, note, images.length])

  const drawTemplate = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Paper-like background with slight texture
    ctx.fillStyle = '#fefefe'
    ctx.fillRect(0, 0, width, height)

    if (template === 'lined') {
      ctx.strokeStyle = '#e8e8e8'
      ctx.lineWidth = 1
      const lineSpacing = 28
      const margin = 40
      
      // Draw lines
      for (let y = lineSpacing * 2; y < height - 20; y += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(margin, y)
        ctx.lineTo(width - margin, y)
        ctx.stroke()
      }
      
      // Margin line (red)
      ctx.strokeStyle = '#ff6b6b'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(margin, 0)
      ctx.lineTo(margin, height)
      ctx.stroke()
      
    } else if (template === 'grid') {
      ctx.strokeStyle = '#e0e0e0'
      ctx.lineWidth = 0.5
      const gridSize = 25
      
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
    } else if (template === 'dotted') {
      ctx.fillStyle = '#c4c4c4'
      const dotSpacing = 20
      const radius = 1.5
      
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    } else if (template === 'cornell') {
      // Cornell note-taking system: Cues, Notes, Summary sections
      ctx.strokeStyle = '#e8e8e8'
      ctx.lineWidth = 1
      
      const leftMargin = width * 0.3 // Left column for cues/keywords
      const bottomMargin = height * 0.15 // Bottom section for summary
      const lineSpacing = 28
      
      // Vertical line separating cues from notes
      ctx.beginPath()
      ctx.moveTo(leftMargin, 0)
      ctx.lineTo(leftMargin, height - bottomMargin)
      ctx.stroke()
      
      // Horizontal line separating summary
      ctx.beginPath()
      ctx.moveTo(0, height - bottomMargin)
      ctx.lineTo(width, height - bottomMargin)
      ctx.stroke()
      
      // Horizontal lines in notes section
      for (let y = lineSpacing * 2; y < height - bottomMargin - 20; y += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(leftMargin + 20, y)
        ctx.lineTo(width - 40, y)
        ctx.stroke()
      }
      
      // Label areas
      ctx.fillStyle = '#999999'
      ctx.font = '12px sans-serif'
      ctx.fillText('Cues', 20, 30)
      ctx.fillText('Notes', leftMargin + 20, 30)
      ctx.fillText('Summary', 20, height - bottomMargin + 25)
      
    } else if (template === 'music') {
      // Music staff paper with 5 lines per staff
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 1
      
      const staffHeight = 80
      const staffSpacing = 100
      const lineSpacing = staffHeight / 4
      const margin = 40
      
      for (let staffTop = 80; staffTop < height - 40; staffTop += staffSpacing) {
        // Draw 5 lines of the staff
        for (let i = 0; i < 5; i++) {
          const y = staffTop + (i * lineSpacing)
          ctx.beginPath()
          ctx.moveTo(margin, y)
          ctx.lineTo(width - margin, y)
          ctx.stroke()
        }
      }
      
    } else if (template === 'graph-small') {
      // Small grid (5mm equivalent)
      ctx.strokeStyle = '#d0d0d0'
      ctx.lineWidth = 0.5
      const gridSize = 15
      
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
      // Thicker lines every 5 cells
      ctx.strokeStyle = '#a0a0a0'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += gridSize * 5) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize * 5) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
    } else if (template === 'graph-large') {
      // Large grid (1cm equivalent)
      ctx.strokeStyle = '#d0d0d0'
      ctx.lineWidth = 0.5
      const gridSize = 30
      
      // Vertical lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      
      // Horizontal lines
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
      // Thicker lines every 5 cells
      ctx.strokeStyle = '#a0a0a0'
      ctx.lineWidth = 1
      for (let x = 0; x < width; x += gridSize * 5) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }
      for (let y = 0; y < height; y += gridSize * 5) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }
      
    } else if (template === 'todo') {
      // To-do list with checkboxes
      ctx.strokeStyle = '#c0c0c0'
      ctx.lineWidth = 1
      const lineSpacing = 40
      const checkboxSize = 16
      const checkboxX = 40
      const textStartX = checkboxX + checkboxSize + 15
      
      for (let y = 60; y < height - 20; y += lineSpacing) {
        // Draw checkbox
        ctx.strokeRect(checkboxX, y - checkboxSize / 2, checkboxSize, checkboxSize)
        
        // Draw line for text
        ctx.beginPath()
        ctx.moveTo(textStartX, y)
        ctx.lineTo(width - 40, y)
        ctx.stroke()
      }
      
    } else if (template === 'wide-ruled') {
      // Wide-ruled paper (college ruled alternative)
      ctx.strokeStyle = '#e8e8e8'
      ctx.lineWidth = 1
      const lineSpacing = 34 // Wider than regular lined
      const margin = 40
      
      // Draw lines
      for (let y = lineSpacing * 2; y < height - 20; y += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(margin, y)
        ctx.lineTo(width - margin, y)
        ctx.stroke()
      }
      
      // Margin line
      ctx.strokeStyle = '#ff6b6b'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(margin, 0)
      ctx.lineTo(margin, height)
      ctx.stroke()
      
    } else if (template === 'narrow-ruled') {
      // Narrow-ruled paper (legal pad style)
      ctx.strokeStyle = '#e8e8e8'
      ctx.lineWidth = 0.8
      const lineSpacing = 22 // Narrower than regular lined
      const margin = 40
      
      // Draw lines
      for (let y = lineSpacing * 2; y < height - 20; y += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(margin, y)
        ctx.lineTo(width - margin, y)
        ctx.stroke()
      }
      
      // Margin line
      ctx.strokeStyle = '#ff6b6b'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(margin, 0)
      ctx.lineTo(margin, height)
      ctx.stroke()
    }
  }


  const getImageAtPoint = (x: number, y: number): CanvasImage | null => {
    // Check images in reverse order (top to bottom)
    for (let i = images.length - 1; i >= 0; i--) {
      const img = images[i]
      if (x >= img.x && x <= img.x + img.width &&
          y >= img.y && y <= img.y + img.height) {
        return img
      }
    }
    return null
  }

  const getResizeHandle = (image: CanvasImage, x: number, y: number): 'nw' | 'ne' | 'sw' | 'se' | null => {
    const handleSize = 12
    const handles = [
      { type: 'nw' as const, x: image.x, y: image.y },
      { type: 'ne' as const, x: image.x + image.width, y: image.y },
      { type: 'sw' as const, x: image.x, y: image.y + image.height },
      { type: 'se' as const, x: image.x + image.width, y: image.y + image.height },
    ]
    
    for (const handle of handles) {
      if (x >= handle.x - handleSize / 2 && x <= handle.x + handleSize / 2 &&
          y >= handle.y - handleSize / 2 && y <= handle.y + handleSize / 2) {
        return handle.type
      }
    }
    return null
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e)
    
    // Check if clicking on an image
    if (activeTool === 'image' || activeTool === 'lasso' || !activeTool) {
      const clickedImage = getImageAtPoint(pos.x, pos.y)
      if (clickedImage) {
        setSelectedImageId(clickedImage.id)
        const handle = getResizeHandle(clickedImage, pos.x, pos.y)
        if (handle) {
          setIsResizing(true)
          setResizeHandle(handle)
          setIsMovingImage(false)
        } else {
          setIsMovingImage(true)
          setIsResizing(false)
          setResizeHandle(null)
        }
        setLastPos(pos)
        redrawCanvas()
        return
      } else {
        setSelectedImageId(null)
        setIsMovingImage(false)
        setIsResizing(false)
        setResizeHandle(null)
      }
    }
    
    if (activeTool === 'shape' && shapeType) {
      setIsDrawing(true)
      setShapeStart(pos)
      setLastPos(pos)
    } else if (activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'highlighter') {
      setIsDrawing(true)
      setLastPos(pos)
      
      // Draw initial point for smoother lines
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          if (activeTool === 'pen') {
            ctx.strokeStyle = penColor
            ctx.lineWidth = penWidth
            ctx.globalAlpha = 1.0
          } else if (activeTool === 'highlighter') {
            ctx.strokeStyle = penColor
            ctx.lineWidth = penWidth * 3
            ctx.globalAlpha = 0.4
          } else if (activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out'
            ctx.globalAlpha = 1.0
            ctx.lineWidth = penWidth * 4
          }
          ctx.beginPath()
          ctx.arc(pos.x, pos.y, penWidth / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentPos = getMousePos(e)

    // Handle image moving
    if (isMovingImage && selectedImageId) {
      const selectedImage = images.find(img => img.id === selectedImageId)
      if (selectedImage) {
        const dx = currentPos.x - lastPos.x
        const dy = currentPos.y - lastPos.y
        
        setImages(prev => prev.map(img => 
          img.id === selectedImageId
            ? { ...img, x: img.x + dx, y: img.y + dy }
            : img
        ))
        setLastPos(currentPos)
        redrawCanvas()
      }
      return
    }

    // Handle image resizing
    if (isResizing && selectedImageId && resizeHandle) {
      const selectedImage = images.find(img => img.id === selectedImageId)
      if (selectedImage) {
        const dx = currentPos.x - lastPos.x
        
        let newX = selectedImage.x
        let newY = selectedImage.y
        let newWidth = selectedImage.width
        let newHeight = selectedImage.height
        
        const aspectRatio = selectedImage.originalWidth / selectedImage.originalHeight
        
        switch (resizeHandle) {
          case 'nw':
            newWidth = selectedImage.width - dx
            newHeight = newWidth / aspectRatio
            newX = selectedImage.x + (selectedImage.width - newWidth)
            newY = selectedImage.y + (selectedImage.height - newHeight)
            break
          case 'ne':
            newWidth = selectedImage.width + dx
            newHeight = newWidth / aspectRatio
            newY = selectedImage.y + (selectedImage.height - newHeight)
            break
          case 'sw':
            newWidth = selectedImage.width - dx
            newHeight = newWidth / aspectRatio
            newX = selectedImage.x + (selectedImage.width - newWidth)
            break
          case 'se':
            newWidth = selectedImage.width + dx
            newHeight = newWidth / aspectRatio
            break
        }
        
        // Minimum size
        const minSize = 50
        if (newWidth < minSize) {
          newWidth = minSize
          newHeight = newWidth / aspectRatio
        }
        if (newHeight < minSize) {
          newHeight = minSize
          newWidth = newHeight * aspectRatio
        }
        
        setImages(prev => prev.map(img => 
          img.id === selectedImageId
            ? { ...img, x: newX, y: newY, width: newWidth, height: newHeight }
            : img
        ))
        setLastPos(currentPos)
        redrawCanvas()
      }
      return
    }

    if (!isDrawing) return

    // Handle shape drawing
    if (activeTool === 'shape' && shapeType && shapeStart) {
      // Clear and redraw template + history
      const historyData = historyRef.current[historyIndexRef.current]
      if (historyData) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawTemplate(ctx, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          // Draw shape preview
          ctx.strokeStyle = penColor
          ctx.fillStyle = penColor
          ctx.lineWidth = penWidth
          ctx.globalAlpha = 1.0
          
          const startX = shapeStart.x
          const startY = shapeStart.y
          const endX = currentPos.x
          const endY = currentPos.y
          const width = endX - startX
          const height = endY - startY
          
          ctx.beginPath()
          
          if (shapeType === 'rectangle') {
            ctx.rect(startX, startY, width, height)
            ctx.stroke()
          } else if (shapeType === 'circle') {
            const radius = Math.sqrt(width * width + height * height) / 2
            ctx.arc((startX + endX) / 2, (startY + endY) / 2, radius, 0, Math.PI * 2)
            ctx.stroke()
          } else if (shapeType === 'line') {
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
          } else if (shapeType === 'arrow') {
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            // Arrowhead
            const angle = Math.atan2(endY - startY, endX - startX)
            const arrowLength = 15
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle - Math.PI / 6),
              endY - arrowLength * Math.sin(angle - Math.PI / 6)
            )
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle + Math.PI / 6),
              endY - arrowLength * Math.sin(angle + Math.PI / 6)
            )
            ctx.stroke()
          }
        }
        img.src = historyData
      }
      return
    }

    // Handle pen/highlighter/eraser drawing
    if (activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'highlighter') {
      if (activeTool === 'pen') {
        ctx.strokeStyle = penColor
        ctx.lineWidth = penWidth
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1.0
      } else if (activeTool === 'highlighter') {
        ctx.strokeStyle = penColor
        ctx.lineWidth = penWidth * 3
        ctx.globalCompositeOperation = 'multiply'
        ctx.globalAlpha = 0.4
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.globalAlpha = 1.0
        ctx.lineWidth = penWidth * 4
      }

      ctx.beginPath()
      ctx.moveTo(lastPos.x, lastPos.y)
      ctx.lineTo(currentPos.x, currentPos.y)
      ctx.stroke()

      setLastPos(currentPos)
    }
  }
  
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    
    let clientX = 0
    let clientY = 0
    
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const drawAllImagesDirectly = (ctx: CanvasRenderingContext2D, _canvasWidth: number, _canvasHeight: number) => {
    // Draw all images - load and draw each one
    images.forEach(imageData => {
      if (!imageData.dataUrl) return
      
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, imageData.x, imageData.y, imageData.width, imageData.height)
        
        // Draw selection border if selected
        if (imageData.id === selectedImageId) {
          ctx.strokeStyle = '#667eea'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.strokeRect(imageData.x - 2, imageData.y - 2, imageData.width + 4, imageData.height + 4)
          ctx.setLineDash([])
          
          // Draw resize handles
          const handleSize = 8
          const handles = [
            { x: imageData.x, y: imageData.y }, // NW
            { x: imageData.x + imageData.width, y: imageData.y }, // NE
            { x: imageData.x, y: imageData.y + imageData.height }, // SW
            { x: imageData.x + imageData.width, y: imageData.y + imageData.height }, // SE
          ]
          
          handles.forEach(handle => {
            ctx.fillStyle = '#ffffff'
            ctx.strokeStyle = '#667eea'
            ctx.lineWidth = 2
            ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
            ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize)
          })
        }
      }
      img.src = imageData.dataUrl
    })
  }

  const drawAllImages = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    drawAllImagesDirectly(ctx, rect.width, rect.height)
  }

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and redraw template
    drawTemplate(ctx, canvas.width, canvas.height)

    // Redraw history if available (handwriting)
    const historyData = historyRef.current[historyIndexRef.current]
    
    if (historyData) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        // Draw images on top of history
        drawAllImages(ctx)
      }
      img.src = historyData
    } else {
      // Draw images directly
      drawAllImages(ctx)
    }
  }, [images, selectedImageId])

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Capture current canvas state - do NOT call redrawCanvas first as it clears
    // the canvas and redraws from old history, which would erase the stroke we just drew
    const dataUrl = canvas.toDataURL()
    
    // Remove any future history if we're in the middle of history
    const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1)
    newHistory.push(dataUrl)
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift()
    } else {
      historyIndexRef.current++
    }
    
    historyRef.current = newHistory
    setHistory(newHistory)
    setHistoryIndex(historyIndexRef.current)
  }, [])

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--
      setHistoryIndex(historyIndexRef.current)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawTemplate(ctx, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
          }
          img.src = historyRef.current[historyIndexRef.current]
        }
      }
    }
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++
      setHistoryIndex(historyIndexRef.current)
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const img = new Image()
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            drawTemplate(ctx, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
          }
          img.src = historyRef.current[historyIndexRef.current]
        }
      }
    }
  }, [])

  const stopDrawing = () => {
    // Stop image moving/resizing
    if (isMovingImage || isResizing) {
      setIsMovingImage(false)
      setIsResizing(false)
      setResizeHandle(null)
      saveToHistory()
      redrawCanvas()
      return
    }

    const canvas = canvasRef.current
    if (!canvas || !isDrawing) {
      setIsDrawing(false)
      setShapeStart(null)
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      setIsDrawing(false)
      setShapeStart(null)
      return
    }

    // Finalize shape drawing
    if (activeTool === 'shape' && shapeType && shapeStart) {
      const historyData = historyRef.current[historyIndexRef.current]
      if (historyData) {
        const img = new Image()
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawTemplate(ctx, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)
          
          const currentPos = { x: lastPos.x, y: lastPos.y }
          const startX = shapeStart.x
          const startY = shapeStart.y
          const endX = currentPos.x
          const endY = currentPos.y
          const width = endX - startX
          const height = endY - startY
          
          ctx.strokeStyle = penColor
          ctx.fillStyle = penColor
          ctx.lineWidth = penWidth
          ctx.globalAlpha = 1.0
          
          ctx.beginPath()
          
          if (shapeType === 'rectangle') {
            ctx.rect(startX, startY, width, height)
            ctx.stroke()
          } else if (shapeType === 'circle') {
            const radius = Math.sqrt(width * width + height * height) / 2
            ctx.arc((startX + endX) / 2, (startY + endY) / 2, radius, 0, Math.PI * 2)
            ctx.stroke()
          } else if (shapeType === 'line') {
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            ctx.stroke()
          } else if (shapeType === 'arrow') {
            ctx.moveTo(startX, startY)
            ctx.lineTo(endX, endY)
            const angle = Math.atan2(endY - startY, endX - startX)
            const arrowLength = 15
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle - Math.PI / 6),
              endY - arrowLength * Math.sin(angle - Math.PI / 6)
            )
            ctx.moveTo(endX, endY)
            ctx.lineTo(
              endX - arrowLength * Math.cos(angle + Math.PI / 6),
              endY - arrowLength * Math.sin(angle + Math.PI / 6)
            )
            ctx.stroke()
          }
          
          saveToHistory()
        }
        img.src = historyData
      }
    } else {
      // Save history for pen/highlighter/eraser
      saveToHistory()
    }

    setIsDrawing(false)
    setShapeStart(null)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawTemplate(ctx, canvas.width, canvas.height)
    setImages([])
    setSelectedImageId(null)
    saveToHistory()
  }

  const saveNote = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Ensure canvas is fully drawn with all images
    redrawCanvas()
    
    // Wait for canvas to update, then save
    setTimeout(() => {
      const handwritingData = canvas.toDataURL('image/png')
      const currentUser = storage.getCurrentUser()

      const noteData: Note = {
        id: note?.id || Date.now().toString(),
        title: title || 'Untitled Note',
        content,
        handwriting: handwritingData,
        template,
        userId: currentUser?.id || '',
        createdAt: note?.createdAt || Date.now(),
        updatedAt: Date.now(),
        isBookmarked,
      }

      storage.saveNote(noteData)
      navigate('/notes')
    }, 100)
  }

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = canvasRef.current
        if (!canvas) return
        
        // Limit image size to fit canvas better
        const maxWidth = canvas.width * 0.6
        const maxHeight = canvas.height * 0.6
        let width = img.width
        let height = img.height
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
        
        const newImage: CanvasImage = {
          id: `img-${Date.now()}`,
          dataUrl: event.target?.result as string,
          x: (canvas.width - width) / 2,
          y: (canvas.height - height) / 2,
          width,
          height,
          originalWidth: img.width,
          originalHeight: img.height,
        }
        
        setImages(prev => [...prev, newImage])
        setSelectedImageId(newImage.id)
        redrawCanvas()
        saveToHistory()
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)

    // Reset input
    e.target.value = ''
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      const dataUrl = canvas.toDataURL('image/png')
      
      if (navigator.share) {
        const blob = await fetch(dataUrl).then(r => r.blob())
        const file = new File([blob], `${title || 'note'}.png`, { type: 'image/png' })
        await navigator.share({
          title: title || 'Note',
          files: [file],
        })
      } else {
        // Fallback to download
        exportNote()
      }
    } catch (error) {
      console.error('Error sharing:', error)
      exportNote()
    }
  }

  const exportNote = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement('a')
    link.download = `${title || 'note'}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // Redraw canvas when images change
  useEffect(() => {
    redrawCanvas()
  }, [images, selectedImageId, redrawCanvas])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedImageId && !isDrawing && !isMovingImage && !isResizing) {
          e.preventDefault()
          setImages(prev => prev.filter(img => img.id !== selectedImageId))
          setSelectedImageId(null)
          saveToHistory()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, selectedImageId, isDrawing, isMovingImage, isResizing, saveToHistory])

  return (
    <div className={`note-editor ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="editor-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate('/notes')}>
            <ArrowLeft size={18} />
          </button>
          <button className="icon-btn" title="Grid View">
            <Grid size={18} />
          </button>
          <button className="icon-btn" title="Search">
            <Search size={18} />
          </button>
          <button 
            className={`icon-btn ${isBookmarked ? 'active' : ''}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
            title="Bookmark"
          >
            <Bookmark size={18} />
          </button>
          <button className="icon-btn" onClick={handleShare} title="Share">
            <Share2 size={18} />
          </button>
        </div>
        <input
          type="text"
          className="note-title-input"
          placeholder="Untitled (Draft)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="header-right">
          <button 
            className={`icon-btn ${historyIndexRef.current <= 0 ? 'disabled' : ''}`}
            onClick={undo}
            title="Undo (Ctrl+Z)"
            disabled={historyIndexRef.current <= 0}
          >
            <Undo2 size={18} />
          </button>
          <button 
            className={`icon-btn ${historyIndexRef.current >= historyRef.current.length - 1 ? 'disabled' : ''}`}
            onClick={redo}
            title="Redo (Ctrl+Y)"
            disabled={historyIndexRef.current >= historyRef.current.length - 1}
          >
            <Redo2 size={18} />
          </button>
          <button className="icon-btn" onClick={saveNote} title="Save Note">
            <Save size={18} />
          </button>
          <button className="icon-btn" onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      <div className="toolbar-top">
        <div className="toolbar-tools">
          <button
            className={`tool-btn-icon ${activeTool === 'pen' ? 'active' : ''}`}
            onClick={() => setActiveTool('pen')}
            title="Pen"
          >
            <PenTool size={22} />
          </button>
          <button
            className={`tool-btn-icon ${activeTool === 'highlighter' ? 'active' : ''}`}
            onClick={() => setActiveTool('highlighter')}
            title="Highlighter"
          >
            <div className="highlighter-icon" style={{ backgroundColor: penColor }} />
          </button>
          <button
            className={`tool-btn-icon ${activeTool === 'eraser' ? 'active' : ''}`}
            onClick={() => setActiveTool('eraser')}
            title="Eraser"
          >
            <Eraser size={22} />
          </button>
          <div className="toolbar-divider" />
          <button
            className={`tool-btn-icon ${activeTool === 'shape' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('shape')
              if (!shapeType) setShapeType('rectangle')
            }}
            title="Shapes"
          >
            <Square size={22} />
          </button>
          {activeTool === 'shape' && (
            <div className="shape-menu">
              <button
                className={`shape-btn ${shapeType === 'rectangle' ? 'active' : ''}`}
                onClick={() => setShapeType('rectangle')}
                title="Rectangle"
              >
                <Square size={18} />
              </button>
              <button
                className={`shape-btn ${shapeType === 'circle' ? 'active' : ''}`}
                onClick={() => setShapeType('circle')}
                title="Circle"
              >
                <Circle size={18} />
              </button>
              <button
                className={`shape-btn ${shapeType === 'line' ? 'active' : ''}`}
                onClick={() => setShapeType('line')}
                title="Line"
              >
                <Minus size={18} />
              </button>
              <button
                className={`shape-btn ${shapeType === 'arrow' ? 'active' : ''}`}
                onClick={() => setShapeType('arrow')}
                title="Arrow"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
          <button
            className={`tool-btn-icon ${activeTool === 'lasso' ? 'active' : ''}`}
            onClick={() => setActiveTool('lasso')}
            title="Lasso Selection"
          >
            <MousePointer2 size={22} />
          </button>
          <div className="toolbar-divider" />
          <label className="tool-btn-icon image-upload-label" title="Insert Image">
            <ImageIcon size={22} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInsert}
              style={{ display: 'none' }}
            />
          </label>
          <button
            className={`tool-btn-icon ${activeTool === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTool('text')}
            title="Text"
          >
            <Type size={22} />
          </button>
        </div>

        {(activeTool === 'pen' || activeTool === 'highlighter') && (
          <div className="color-palette">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.color}
                className={`color-btn ${penColor === preset.color ? 'active' : ''}`}
                style={{ backgroundColor: preset.color }}
                onClick={() => setPenColor(preset.color)}
                title={preset.name}
              />
            ))}
            <input
              type="color"
              value={penColor}
              onChange={(e) => setPenColor(e.target.value)}
              className="color-picker-custom"
              title="Custom Color"
            />
          </div>
        )}

        {(activeTool === 'pen' || activeTool === 'eraser' || activeTool === 'highlighter') && (
          <div className="pen-size-control">
            <label>Size</label>
            <input
              type="range"
              min="1"
              max="15"
              value={penWidth}
              onChange={(e) => setPenWidth(Number(e.target.value))}
              className="width-slider"
            />
            <span className="width-indicator">{penWidth}</span>
          </div>
        )}

        <div className="template-selector">
          <select
            value={template}
            onChange={(e) => {
              setTemplate(e.target.value as typeof template)
              setTimeout(() => {
                const canvas = canvasRef.current
                if (canvas) {
                  const ctx = canvas.getContext('2d')
                  if (ctx) {
                    drawTemplate(ctx, canvas.width, canvas.height)
                    if (note?.handwriting) {
                      const img = new Image()
                      img.onload = () => {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                      }
                      img.src = note.handwriting
                    }
                  }
                }
              }, 0)
            }}
            className="template-select"
          >
            <option value="blank">Blank</option>
            <option value="lined">Lined</option>
            <option value="wide-ruled">Wide Ruled</option>
            <option value="narrow-ruled">Narrow Ruled</option>
            <option value="grid">Grid</option>
            <option value="graph-small">Graph (Small)</option>
            <option value="graph-large">Graph (Large)</option>
            <option value="dotted">Dotted</option>
            <option value="cornell">Cornell Notes</option>
            <option value="music">Music Paper</option>
            <option value="todo">To-Do List</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button className="icon-btn" onClick={clearCanvas} title="Clear">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="editor-container">
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            className={`drawing-canvas ${isMovingImage ? 'moving' : ''} ${isResizing ? 'resizing' : ''}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        {activeTool === 'text' && (
          <div className="text-editor-panel">
            <h3>Text Content</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your notes here..."
              className="text-editor"
              rows={10}
            />
          </div>
        )}
      </div>
    </div>
  )
}
