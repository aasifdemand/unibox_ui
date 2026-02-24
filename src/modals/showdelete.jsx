import { AlertCircle, Loader2, X, Trash2, Shield } from "lucide-react";
import { motion } from "motion/react";
import Modal from "../components/shared/modal";

const ShowDelete = ({
  campaign,
  showDeleteModal,
  setShowDeleteModal,
  handleDelete,
  isDeleting,
}) => {
  return (
    <Modal
      isOpen={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      maxWidth="max-w-md"
      closeOnBackdrop={true}
    >
      <div className="bg-linear-to-br from-rose-600 to-red-700 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <Trash2 className="w-16 h-16 text-white" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 backdrop-blur-sm"
            >
              <Trash2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">
                Delete Campaign
              </h3>
              <p className="text-[10px] font-bold text-rose-100/70 uppercase tracking-widest mt-0.5">
                This action cannot be undone
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tight mb-2">
              Confirm Deletion
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-extrabold text-slate-800">
                "{campaign?.name}"
              </span>
              ? This campaign will be permanently removed and cannot be
              recovered.
            </p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 mb-6">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] font-bold text-amber-700 leading-relaxed">
              This will permanently delete all campaign data including
              statistics, sent emails, and analytics. This action is
              irreversible.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="group relative px-8 py-3 bg-rose-600 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl shadow-rose-600/20 hover:shadow-rose-600/40 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 overflow-hidden"
          >
            <motion.div
              layout
              className="flex items-center gap-3"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Campaign
                </>
              )}
            </motion.div>
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest text-center">
            This action is permanent and cannot be reversed
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ShowDelete;
