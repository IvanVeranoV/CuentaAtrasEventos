import useDialogAccessibility from '../hooks/useDialogAccessibility';

export default function NotificationModal({ isOpen, onClose, type, title, message }) {
    const dialogRef = useDialogAccessibility({ isOpen, onClose });

    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
        <div className="ui-overlay fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Contenedor del Modal */}
            <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="notification-title" aria-describedby="notification-description" tabIndex={-1} className="ui-panel relative w-full max-w-sm p-6 text-center">

                {/* Icono Dinámico */}
                <div aria-hidden="true" className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4 ${isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                    {isSuccess ? (
                        // Icono de Éxito (Check)
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        // Icono de Error (X / Alerta)
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    )}
                </div>

                {/* Texto del Mensaje */}
                <h3 id="notification-title" className="text-lg font-bold text-white mb-2">
                    {title}
                </h3>
                <p id="notification-description" className="text-sm text-neutral-300 leading-relaxed mb-6">
                    {message}
                </p>

                {/* Botón de Cierre */}
                <button
                    type="button"
                    onClick={onClose}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm cursor-pointer ${isSuccess
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                >
                    {isSuccess ? 'Entendido' : 'Cerrar'}
                </button>
            </div>
        </div>
    );
}