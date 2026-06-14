import { ChatWindow } from '@/components/widget/ChatWindow';

interface Props {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function WidgetFramePage({ searchParams }: Props) {
  const { projectId = 'default' } = await searchParams;

  return (
    <div className="h-screen w-full overflow-hidden p-0">
      <ChatWindow
        projectId={projectId}
        className="h-full w-full rounded-none border-0 shadow-none"
      />
    </div>
  );
}
