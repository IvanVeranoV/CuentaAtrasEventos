import useDialogAccessibility from '../hooks/useDialogAccessibility';

export default function ConfirmModal({ isOpen, isActive = true, onClose, onConfirm, eventTitle }) {
    const dialogRef = useDialogAccessibility({ isOpen, isActive, onClose });
    if (!isOpen) return null;

    return (
        <div className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Caja del Modal */}
            <div
                ref={dialogRef}
                role="alertdialog"
                aria-modal={isActive}
                aria-hidden={isActive ? undefined : true}
                aria-labelledby="delete-event-title"
                aria-describedby="delete-event-description"
                tabIndex={-1}
                className="ui-panel relative w-full max-w-md p-6 text-center sm:text-left"
            >

                {/* Icono de advertencia */}
                <div aria-hidden="true" className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 mb-4 sm:mb-0 sm:absolute sm:top-6 sm:left-6">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                </div>

                {/* Contenido de texto */}
                <div className="sm:pl-16">
                    <h3 id="delete-event-title" className="text-lg font-bold text-white mb-2">
                        ¿Eliminar evento?
                    </h3>
                    <p id="delete-event-description" className="text-sm text-neutral-300 leading-relaxed">
                        ¿Estás seguro de que deseas eliminar <span className="text-slate-200 font-semibold">"{eventTitle}"</span>? Esta acción no se puede deshacer y perderás la cuenta atrás.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="mt-6 sm:pl-16 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-rose-600/20"
                    >
                        Eliminar evento
                    </button>
                </div>
            </div>
        </div>
    );
}