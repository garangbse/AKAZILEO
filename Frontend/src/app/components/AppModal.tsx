import React from 'react';
import { X, CheckCircle, XCircle, Trash2, Upload, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

  type TaskData = { title: string; description: string; payment:number; due_date:string; };

   

  function CreateTaskForm({
    taskData,
    setTaskData,
  }: {
    taskData: TaskData;
    setTaskData: React.Dispatch<React.SetStateAction<TaskData>>;
  }) {
  

  return (
    <div className="w-full flex flex-col gap-2">
      <input
        placeholder="Title"
        value={taskData.title}
        onChange={(e) =>
          setTaskData((prev: TaskData) => ({ ...prev, title: e.target.value }))
        }
        className="px-3 py-2 rounded-xl text-sm"
      />

      <textarea
        placeholder="Description"
        value={taskData.description}
        onChange={(e) =>
          setTaskData((prev: any) => ({ ...prev, description: e.target.value }))
        }
        className="px-3 py-2 rounded-xl text-sm"
      />

      <input
        type="number"
        placeholder="Payment"
        value={taskData.payment}
        onChange={(e) =>
          setTaskData((prev:any) => ({
            ...prev,
            payment: Number(e.target.value),
          }))
        }
      />

      <input
        type="string"
        placeholder="Due_Date"
        value={taskData.due_date}
        onChange={(e) =>
          setTaskData((prev:any) => ({
            ...prev, due_date: e.target.value,}))
        }
      />
    </div>

    
  );
}

export function AppModal() {
  const { modal, closeModal, addTask } = useAppContext();

  const [taskData, setTaskData] = React.useState<TaskData>({
  title: '',
  description: '',
  payment:0,
  due_date: ''
    });

  React.useEffect(() => {
    if (modal.type === 'create-task') {
      setTaskData({ title: '', description: '' ,payment:0, due_date:''});
    }
  }, [modal.type]);
  if (!modal.type) return null;

  


  const configs: Record<
    string,
    {
      icon: React.ReactNode;
      title: string;
      message: string;
      confirmLabel: string;
      confirmStyle: React.CSSProperties;
      showCancel?: boolean;
    }
  > = {
    'confirm-submit': {
      icon: <Upload size={28} style={{ color: '#BFC897' }} />,
      title: modal.title || 'Submit Your Work',
      message:
        modal.message ||
        'Are you sure you want to submit your work? The employer will be notified.',
      confirmLabel: 'Submit',
      confirmStyle: { backgroundColor: '#3C3F20' },
      showCancel: true,
    },
    approve: {
      icon: <CheckCircle size={28} style={{ color: '#BFC897' }} />,
      title: 'Approve Submission',
      message: 'Are you sure you want to approve this submission? The worker will be notified.',
      confirmLabel: 'Approve',
      confirmStyle: { backgroundColor: '#BFC897', color: '#3C3F20' },
      showCancel: true,
    },
    reject: {
      icon: <XCircle size={28} className="text-red-500" />,
      title: 'Reject Submission',
      message: 'Are you sure you want to reject this submission?',
      confirmLabel: 'Reject',
      confirmStyle: { backgroundColor: '#c0392b' },
      showCancel: true,
    },
    delete: {
      icon: <Trash2 size={28} className="text-red-500" />,
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item? This action cannot be undone.',
      confirmLabel: 'Delete',
      confirmStyle: { backgroundColor: '#c0392b' },
      showCancel: true,
    },
    'upload-success': {
      icon: <CheckCircle size={28} style={{ color: '#BFC897' }} />,
      title: 'File Uploaded',
      message: 'Your file has been attached successfully.',
      confirmLabel: 'Done',
      confirmStyle: { backgroundColor: '#3C3F20' },
      showCancel: false,
    },
    'upload-error': {
      icon: <AlertCircle size={28} className="text-red-500" />,
      title: 'Upload Failed',
      message: 'There was an error uploading your file. Please try again.',
      confirmLabel: 'Close',
      confirmStyle: { backgroundColor: '#3C3F20' },
      showCancel: false,
    },
    'add-portfolio': {
      icon: <CheckCircle size={28} style={{ color: '#BFC897' }} />,
      title: 'Portfolio Item Added',
      message: 'Your new portfolio item has been added successfully.',
      confirmLabel: 'Great!',
      confirmStyle: { backgroundColor: '#3C3F20' },
      showCancel: false,
    },
    'create-task': {
    icon: <Upload size={28} style={{ color: '#BFC897' }} />,
    title: 'Create Task',
    message: '',
    confirmLabel: 'Create',
    confirmStyle: { backgroundColor: '#3C3F20' },
    showCancel: true,
  },
  };

  const config = configs[modal.type];
  if (!config) return null;

  const handleConfirm = () => {
    if (modal.type === 'create-task') {
    addTask(taskData);
  } else {
    modal.onConfirm?.();
  }

  closeModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={closeModal}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: '#FDF9EB' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
        >
          <X size={16} style={{ color: '#3C3F20' }} />
        </button>

        <div className="flex flex-col items-center text-center gap-3">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: '#E8E3C8' }}
          >
            {config.icon}
          </div>
          <h2 style={{ color: '#3C3F20' }}>{config.title}</h2>
          {/* ✅ THIS IS WHERE YOUR FORM GOES */}
            {modal.type === 'create-task' ? (
              <CreateTaskForm taskData={taskData} setTaskData={setTaskData} />
            ) : (
              <p className="text-sm opacity-60 leading-relaxed" style={{ color: '#3C3F20' }}>
                {config.message}
              </p>
            )}
          <div className="flex gap-3 mt-3 w-full">
            {config.showCancel && (
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm border cursor-pointer hover:bg-black/5 transition-all"
                style={{ borderColor: '#3C3F20', color: '#3C3F20' }}
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl text-sm text-white cursor-pointer transition-all hover:opacity-90"
              style={config.confirmStyle}
            >
              {config.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
