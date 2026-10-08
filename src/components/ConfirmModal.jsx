import useDialogAccessibility from '../hooks/useDialogAccessibility';

export default function ConfirmModal({ isOpen, isActive = true, onClose, onConfirm, eventTitle }) {
    const dialogRef = useDialogAccessibility({ isOpen, isActive, onClose });
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-950/60 animate-fade-in">
            {/* Caja del Modal */}
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal={isActive}
                aria-hidden={isActive ? undefined : true}
                aria-labelledby="delete-event-title"
                tabIndex={-1}
                className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center sm:text-left"
            >

                {/* Icono de advertencia */}
                <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 sm:mb-0 sm:absolute sm:top-6 sm:left-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>

                {/* Contenido de texto */}
                <div className="sm:pl-16">
                    <h3 id="delete-event-title" className="text-lg font-bold text-white mb-2">
                        ¿Eliminar evento?
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        ¿Estás seguro de que deseas eliminar <span className="text-slate-200 font-semibold">"{eventTitle}"</span>? Esta acción no se puede deshacer y perderás la cuenta atrás.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 sm:pl-16 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 rounded-xl font-medium text-sm transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-rose-600/20"
                    >
                        Eliminar evento
                    </button>
                </div>
            </div>
        </div>
    );
}