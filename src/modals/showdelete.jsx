import { AlertCircle, Loader2 } from "lucide-react";
import Modal from "../components/shared/modal";

const ShowDelete = ({
  campaign,
  showDeleteModal, // ✅ Add this prop
  setShowDeleteModal,
  handleDelete,
  isDeleting,
}) => {
  return (
    <Modal
      isOpen={showDeleteModal} // ✅ Use the visibility state, not loading state
      onClose={() => setShowDeleteModal(false)}
      maxWidth="max-w-md"
      closeOnBackdrop={true}
    >
      <div className="bg-white rounded-2xl p-6 w-full">
        <div className="flex items-center mb-4 text-red-600">
          <AlertCircle className="w-6 h-6 mr-2" />
          <h3 className="text-lg font-semibold">Delete Campaign</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{campaign?.name}"? This action cannot
          be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition flex items-center"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Campaign"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShowDelete;
