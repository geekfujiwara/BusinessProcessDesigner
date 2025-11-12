import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ExternalLink } from "lucide-react"

interface LinkConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
  description?: string
}

export function LinkConfirmModal({ 
  isOpen, 
  onClose, 
  url, 
  title, 
  description 
}: LinkConfirmModalProps) {
  const handleConfirm = () => {
    window.open(url, '_blank', 'noreferrer noopener')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            外部リンクを開きますか？
          </DialogTitle>
          <DialogDescription>
            以下のページに移動します：
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">タイトル:</label>
              <p className="text-sm text-muted-foreground mt-1">{title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium">URL:</label>
              <p className="text-sm text-muted-foreground mt-1 break-all font-mono bg-muted p-2 rounded">
                {url}
              </p>
            </div>
            
            {description && (
              <div>
                <label className="text-sm font-medium">説明:</label>
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>
            開く
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// カスタムフック: リンクモーダルの管理
export function useLinkModal() {
  const [modalData, setModalData] = useState<{
    isOpen: boolean
    url: string
    title: string
    description?: string
  }>({
    isOpen: false,
    url: '',
    title: '',
    description: ''
  })

  const openModal = (url: string, title: string, description?: string) => {
    setModalData({
      isOpen: true,
      url,
      title,
      description
    })
  }

  const closeModal = () => {
    setModalData(prev => ({ ...prev, isOpen: false }))
  }

  return {
    modalData,
    openModal,
    closeModal
  }
}