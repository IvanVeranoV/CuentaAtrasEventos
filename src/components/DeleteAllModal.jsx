import useDialogAccessibility from '../hooks/useDialogAccessibility';

export default function DeleteAllModal({ isOpen, isActive = true, onClose, onConfirm }) {
  const dialogRef = useDialogAccessibility({ isOpen, isActive, onClose });
  if (!isOpen) return null;

  return (
    <div className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal={isActive}
        aria-hidden={isActive ? undefined : true}
        aria-labelledby="delete-all-title"
        aria-describedby="delete-all-description"
        tabIndex={-1}
        className="ui-panel relative w-full max-w-md p-6 text-left"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div aria-hidden="true" className="p-2 bg-red-950/50 border border-red-900/40 rounded-xl text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 id="delete-all-title" className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-red-400 to-orange-400">
            ¿Eliminar todo?
          </h3>
        </div>

        <p id="delete-all-description" className="text-neutral-300 text-sm leading-relaxed mb-6">
          Estás a punto de borrar <span className="text-red-400 font-semibold">todos los eventos</span> creados en la aplicación. Esta acción vaciará el almacenamiento local y no se puede deshacer.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-linear-to-r from-red-500 to-orange-500 hover:from-red-400 hover:to-orange-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/20 cursor-pointer text-center"
          >
            Sí, vaciar todo
          </button>
        </div>
      </div>
    </div>
  );
}
