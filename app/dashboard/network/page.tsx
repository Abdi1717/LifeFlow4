'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NetworkProvider } from "@/lib/contexts/network-context"
import { NetworkUploader } from "@/components/network-uploader"
import { NetworkGraph } from "@/components/network-graph"
import { NetworkContactList } from "@/components/network-contact-list"
import { NetworkSearch } from "@/components/network-search"
import { Suspense } from "react"
import { Loading } from "@/components/loading"

export default function NetworkPage() {
  return (
    <NetworkProvider>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Network</h2>
          <p className="text-muted-foreground">
            Visualize your professional network and manage your contacts.
          </p>
        </div>

        <Tabs defaultValue="graph" className="space-y-4">
          <TabsList>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="contacts">Contact List</TabsTrigger>
            <TabsTrigger value="upload">Upload Cards</TabsTrigger>
          </TabsList>
          
          <TabsContent value="graph" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Network Visualization</CardTitle>
                <CardDescription>
                  Interactive visualization of your professional network.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-4">
                <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-4 lg:space-y-0">
                  <div className="w-full lg:w-1/4">
                    <Suspense fallback={<Loading />}>
                      <NetworkSearch />
                    </Suspense>
                  </div>
                  <div className="w-full lg:w-3/4 h-[600px] rounded-lg border border-border overflow-hidden">
                    <Suspense fallback={<Loading />}>
                      <NetworkGraph />
                    </Suspense>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contacts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact Management</CardTitle>
                <CardDescription>
                  View and manage your contact list.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Loading />}>
                  <NetworkContactList />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Business Cards</CardTitle>
                <CardDescription>
                  Upload and scan business cards to extract contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Loading />}>
                  <NetworkUploader />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </NetworkProvider>
  )
} 