import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Image, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const existingDocs = [
  { name: 'Blood Test Report - Mar 2026.pdf', type: 'Lab Report', size: '2.3 MB', date: '2026-03-15' },
  { name: 'Chest X-Ray - Feb 2026.png', type: 'Imaging', size: '4.1 MB', date: '2026-02-20' },
  { name: 'ECG Report - Jan 2026.pdf', type: 'Lab Report', size: '1.8 MB', date: '2026-01-10' },
];

export default function PatientDocuments() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const simulateUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          toast.success('Document uploaded successfully');
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold">Documents</h1>
        <p className="text-muted-foreground text-sm mt-1">Upload and manage your medical documents</p>
      </motion.div>

      {/* Upload zone */}
      <Card>
        <CardContent className="p-6">
          <div onClick={simulateUpload}
            className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium text-sm">Click to upload lab reports</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, PNG, JPG up to 10MB</p>
          </div>
          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents gallery */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">My Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {existingDocs.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    {doc.name.endsWith('.pdf') ? <FileText className="w-5 h-5 text-muted-foreground" /> : <Image className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.type} • {doc.size} • {doc.date}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => toast.info('Preview opened')}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.success('Document deleted')}>
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
