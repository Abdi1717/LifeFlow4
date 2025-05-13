'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useNetwork } from '@/lib/contexts/network-context'
import { ContactInfo, NetworkGroup } from '@/lib/contexts/network-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { UserCircle2, ZoomIn, ZoomOut, RotateCcw, UserCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/loading'

// Dynamically import ForceGraph2D with no SSR to avoid Next.js hydration issues
const ForceGraph2D = dynamic(() => import('react-force-graph').then(mod => mod.ForceGraph2D), {
  ssr: false,
  loading: () => <Loading size="lg" />
})

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface Node {
  id: string
  name: string
  company?: string
  group?: string
  color?: string
  imageUrl?: string
  val?: number
  isPrimary?: boolean
}

interface Link {
  source: string
  target: string
  strength?: number
}

export function NetworkGraph() {
  const { contacts, connections, groups, selectedContact, setSelectedContact, filteredContactIds } = useNetwork()
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] })
  const [highlightNodes, setHighlightNodes] = useState(new Set<string>())
  const [highlightLinks, setHighlightLinks] = useState(new Set<string>())
  const [centerForce, setCenterForce] = useState(0.5)
  const [zoomLevel, setZoomLevel] = useState(1.5)
  const fgRef = useRef<any>()
  
  // Add a mock current user as the central node
  const currentUser = {
    id: 'current-user',
    name: 'You',
    isPrimary: true,
    val: 2.5, // larger node
    color: '#4f46e5' // primary color
  }
  
  // Convert contacts and connections to graph data format
  useEffect(() => {
    // Create nodes for all contacts
    let nodes: Node[] = [
      currentUser,
      ...contacts.map(contact => {
        // Find the primary group for this contact (use the first one)
        const groupId = contact.groups[0] || null
        const group = groups.find(g => g.id === groupId)
        
        return {
          id: contact.id,
          name: contact.name,
          company: contact.company,
          group: groupId,
          color: group?.color || '#9ca3af', // default color if no group
          imageUrl: contact.imageUrl,
          val: 1.5 // standard size
        }
      })
    ]
    
    // If we have a filter, only include filtered contacts
    if (filteredContactIds) {
      nodes = nodes.filter(node => 
        node.id === 'current-user' || filteredContactIds.includes(node.id)
      )
    }
    
    // Create links between contacts
    let links: Link[] = [
      // Connect each contact to the current user
      ...contacts
        .filter(contact => !filteredContactIds || filteredContactIds.includes(contact.id))
        .map(contact => ({
          source: 'current-user',
          target: contact.id,
          strength: 5
        }))
    ]
    
    // Add existing connections between contacts
    connections.forEach(conn => {
      // Only include connections for filtered contacts if we have a filter
      if (filteredContactIds && 
          (!filteredContactIds.includes(conn.source) || 
           !filteredContactIds.includes(conn.target))) {
        return
      }
      
      // Make sure both source and target nodes exist
      const sourceExists = nodes.some(node => node.id === conn.source)
      const targetExists = nodes.some(node => node.id === conn.target)
      
      if (sourceExists && targetExists) {
        links.push({
          source: conn.source,
          target: conn.target,
          strength: conn.strength
        })
      }
    })
    
    setGraphData({ nodes, links })
  }, [contacts, connections, groups, filteredContactIds])
  
  // Handle node click to show contact details
  const handleNodeClick = useCallback((node: any) => {
    if (node.id === 'current-user') {
      return
    }
    
    const contact = contacts.find(c => c.id === node.id)
    if (contact) {
      setSelectedContact(contact)
    }
  }, [contacts, setSelectedContact])
  
  // Handle node hover to highlight connections
  const handleNodeHover = useCallback((node: any) => {
    if (!node) {
      setHighlightNodes(new Set())
      setHighlightLinks(new Set())
      return
    }
    
    const neighbors = new Set<string>()
    neighbors.add(node.id)
    
    const links = new Set<string>()
    
    // Find all connected nodes
    graphData.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      
      if (sourceId === node.id) {
        neighbors.add(targetId)
        links.add(`${sourceId}-${targetId}`)
      } else if (targetId === node.id) {
        neighbors.add(sourceId)
        links.add(`${sourceId}-${targetId}`)
      }
    })
    
    setHighlightNodes(neighbors)
    setHighlightLinks(links)
  }, [graphData.links])
  
  // Reset graph view
  const handleResetView = useCallback(() => {
    if (fgRef.current) {
      fgRef.current.centerAt(0, 0, 1000)
      fgRef.current.zoom(zoomLevel, 1000)
      setCenterForce(0.5)
    }
  }, [zoomLevel])
  
  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (fgRef.current) {
      const newZoom = zoomLevel * 1.2
      setZoomLevel(newZoom)
      fgRef.current.zoom(newZoom, 500)
    }
  }, [zoomLevel])
  
  const handleZoomOut = useCallback(() => {
    if (fgRef.current) {
      const newZoom = zoomLevel / 1.2
      setZoomLevel(newZoom)
      fgRef.current.zoom(newZoom, 500)
    }
  }, [zoomLevel])
  
  // Custom node rendering
  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.name
    const fontSize = 12/globalScale
    const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id)
    const nodeColor = isHighlighted ? node.color : '#d1d5db' // Use a muted color for non-highlighted nodes
    
    // Draw node circle
    ctx.beginPath()
    ctx.arc(node.x, node.y, node.val * 5, 0, 2 * Math.PI)
    ctx.fillStyle = nodeColor
    ctx.fill()
    ctx.strokeStyle = isHighlighted ? '#ffffff' : '#9ca3af'
    ctx.lineWidth = isHighlighted ? 2/globalScale : 1/globalScale
    ctx.stroke()
    
    // Add a label below the node
    if (isHighlighted) {
      ctx.font = `${fontSize}px Sans-Serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#ffffff'
      
      // Draw background for text
      const textWidth = ctx.measureText(label).width
      const bckgDimensions = [textWidth + 8, fontSize + 4].map(n => n/globalScale)
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(
        node.x - bckgDimensions[0]/2,
        node.y + node.val * 5 + 2/globalScale,
        bckgDimensions[0],
        bckgDimensions[1]
      )
      
      // Draw text
      ctx.fillStyle = '#ffffff'
      ctx.fillText(
        label,
        node.x,
        node.y + node.val * 5 + 2/globalScale + 2/globalScale
      )
      
      // Draw company name if available
      if (node.company && node.id !== 'current-user') {
        const companyLabel = node.company
        ctx.font = `${fontSize * 0.9}px Sans-Serif`
        const companyTextWidth = ctx.measureText(companyLabel).width
        const companyBckgDimensions = [companyTextWidth + 8, fontSize + 2].map(n => n/globalScale)
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.fillRect(
          node.x - companyBckgDimensions[0]/2,
          node.y + node.val * 5 + 2/globalScale + bckgDimensions[1] + 2/globalScale,
          companyBckgDimensions[0],
          companyBckgDimensions[1]
        )
        
        ctx.fillStyle = '#d1d5db'
        ctx.fillText(
          companyLabel,
          node.x,
          node.y + node.val * 5 + 2/globalScale + bckgDimensions[1] + 2/globalScale + 2/globalScale
        )
      }
    }
  }, [highlightNodes])
  
  // Custom link rendering
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    // Get start and end coordinates
    const start = link.source
    const end = link.target
    
    // Calculate link color based on highlight status
    const sourceId = typeof start === 'object' ? start.id : start
    const targetId = typeof end === 'object' ? end.id : target
    const isHighlighted = highlightLinks.size === 0 || highlightLinks.has(`${sourceId}-${targetId}`)
    
    // Set line style based on highlight and strength
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.strokeStyle = isHighlighted ? '#4f46e5' : '#d1d5db'
    ctx.lineWidth = (isHighlighted ? 2 : 1) * (link.strength ? link.strength/10 : 1) / globalScale
    ctx.stroke()
  }, [highlightLinks])
  
  return (
    <div className="relative h-full">
      {/* Network Graph */}
      <div className="absolute inset-0">
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={fgRef}
            graphData={graphData}
            nodeId="id"
            nodeVal="val"
            nodeColor="color"
            nodeCanvasObject={nodeCanvasObject}
            linkCanvasObject={linkCanvasObject}
            linkDirectionalParticles={4}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.01}
            onNodeClick={handleNodeClick}
            onNodeHover={handleNodeHover}
            cooldownTicks={100}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            d3Force="center"
            d3ForceStrength={centerForce}
            warmupTicks={100}
            onEngineStop={() => fgRef.current?.zoomToFit(400, 40)}
          />
        )}
      </div>
      
      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10">
        <Card className="w-auto">
          <CardContent className="p-4 flex flex-col space-y-4">
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={handleZoomIn} title="Zoom In">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleZoomOut} title="Zoom Out">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleResetView} title="Reset View">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="center-force" className="text-xs">Center Force</Label>
                <span className="text-xs">{centerForce.toFixed(1)}</span>
              </div>
              <Slider
                id="center-force"
                min={0}
                max={1}
                step={0.1}
                value={[centerForce]}
                onValueChange={(values) => {
                  setCenterForce(values[0])
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Selected Contact Detail Panel */}
      {selectedContact && (
        <div className="absolute top-4 left-4 z-10 w-72">
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                  <h3 className="font-medium">{selectedContact.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedContact.title}</p>
                  <p className="text-sm font-medium">{selectedContact.company}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedContact(null)}
                >
                  <UserCircle className="h-8 w-8" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Email</Label>
                  <p className="text-sm">{selectedContact.email}</p>
                </div>
                
                <div>
                  <Label className="text-xs">Phone</Label>
                  <p className="text-sm">{selectedContact.phone}</p>
                </div>
                
                {selectedContact.website && (
                  <div>
                    <Label className="text-xs">Website</Label>
                    <p className="text-sm">{selectedContact.website}</p>
                  </div>
                )}
                
                {selectedContact.tags && selectedContact.tags.length > 0 && (
                  <div>
                    <Label className="text-xs">Tags</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedContact.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedContact.groups && selectedContact.groups.length > 0 && (
                  <div>
                    <Label className="text-xs">Groups</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedContact.groups.map((groupId) => {
                        const group = groups.find(g => g.id === groupId)
                        return group ? (
                          <Badge 
                            key={groupId} 
                            style={{ backgroundColor: group.color }}
                            className="text-white text-xs"
                          >
                            {group.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 