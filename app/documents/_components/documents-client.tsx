'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Home,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Document {
  id: string;
  filename: string;
  platform: string;
  uploadDate: string;
  processingStatus: string;
  incomeRecords: any[];
}

interface Props {
  subscriptionStatus: string;
  documents: Document[];
}

export function DocumentsClient({ subscriptionStatus, documents }: Props) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('Uber');
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (subscriptionStatus !== 'active') {
      setError('Please subscribe to upload documents');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (const file of Array.from(files)) {
        // Generate presigned URL
        const presignedResponse = await fetch('/api/upload/presigned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            isPublic: false,
          }),
        });

        if (!presignedResponse.ok) {
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, cloud_storage_path } = await presignedResponse.json();

        // Check if Content-Disposition header is required
        const urlObj = new URL(uploadUrl);
        const signedHeaders = urlObj.searchParams.get('X-Amz-SignedHeaders');
        const needsContentDisposition = signedHeaders?.includes('content-disposition');

        // Upload file to S3
        const uploadHeaders: HeadersInit = {
          'Content-Type': file.type,
        };
        if (needsContentDisposition) {
          uploadHeaders['Content-Disposition'] = 'attachment';
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: uploadHeaders,
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file');
        }

        // Complete upload and process document
        const completeResponse = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloud_storage_path,
            filename: file.name,
            platform: selectedPlatform,
          }),
        });

        if (!completeResponse.ok) {
          throw new Error('Failed to save document');
        }
      }

      router.refresh();
    } catch (error: any) {
      console.error('Upload error:', error);
      setError(error?.message || 'Failed to upload documents');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold dark:text-white">GigProofer</span>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Documents</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Upload your gig platform earnings statements for AI-powered extraction
            </p>
          </div>

          {/* Upload Section */}
          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="dark:text-gray-200">Platform</Label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Uber">Uber</SelectItem>
                    <SelectItem value="Lyft">Lyft</SelectItem>
                    <SelectItem value="DoorDash">DoorDash</SelectItem>
                    <SelectItem value="Instacart">Instacart</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="dark:text-gray-200">Upload Files</Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-600 transition-colors dark:bg-gray-950/50">
                  <Upload className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">PDF, PNG, JPG files accepted</p>
                  <Input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading || subscriptionStatus !== 'active'}
                    className="max-w-xs mx-auto cursor-pointer"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-800 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              {subscriptionStatus !== 'active' && (
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-lg text-orange-800 dark:text-orange-300 text-sm">
                  <p>Subscribe to upload documents and extract income data.</p>
                  <Link href="/subscription">
                    <Button size="sm" className="mt-2">
                      Subscribe Now
                    </Button>
                  </Link>
                </div>
              )}

              {isUploading && (
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing documents...</span>
                </div>
              )}
            </div>
          </Card>

          {/* Documents List */}
          <div>
            <h2 className="text-xl font-semibold dark:text-white mb-4">Uploaded Documents</h2>
            <div className="space-y-3">
              {documents.length === 0 ? (
                <Card className="p-8 text-center text-gray-500 dark:text-gray-400 dark:bg-gray-900 dark:border-gray-800">
                  <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p>No documents uploaded yet</p>
                </Card>
              ) : (
                documents.map((doc) => (
                  <Card key={doc.id} className="p-4 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        <div className="flex-1">
                          <p className="font-medium dark:text-white">{doc.filename}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{doc.platform}</span>
                            </span>
                            <span>
                              {new Date(doc.uploadDate).toLocaleDateString()}
                            </span>
                            <span>
                              {doc.incomeRecords.length} record(s) extracted
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.processingStatus === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        )}
                        {doc.processingStatus === 'processing' && (
                          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 animate-spin" />
                        )}
                        {doc.processingStatus === 'failed' && (
                          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <span className="text-sm capitalize dark:text-gray-300">
                          {doc.processingStatus}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
