interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]
    ">
      <div className=" bg-gray-800 p-6 rounded-lg shadow-xl relative max-w-2xl w-full m-4 z-[101]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
