
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMentorRequests,
  approveMentorRequest,
  rejectMentorRequest,
} from "../store/mentorRequestsSlice";

function MentorRequests() {
  const dispatch = useDispatch();

  const { requests, loading, error } = useSelector(
    (state) => state.mentorRequests
  );

  useEffect(() => {
    dispatch(fetchMentorRequests());
  }, [dispatch]);

  const handleApprove = (id) => {
    dispatch(approveMentorRequest(id));
  };

  const handleReject = (id) => {
    dispatch(rejectMentorRequest(id));
  };

  return (
    <div className="mentor-requests-page min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-10">
      <style>{`
        .mentor-requests-page {
          color: #1e293b;
        }

        .mentor-request-card {
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: white;
          padding: 22px;
          box-shadow: 0 6px 24px rgba(15, 23, 42, 0.04);
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .mentor-request-card:hover {
          border-color: #c4b5fd;
          box-shadow: 0 10px 28px rgba(109, 40, 217, 0.07);
        }

        .mentor-request-status {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .mentor-request-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .mentor-request-status.approved {
          background: #dcfce7;
          color: #166534;
        }

        .mentor-request-status.rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .mentor-action-button {
          border-radius: 10px;
          padding: 10px 17px;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s, transform 0.2s;
        }

        .mentor-action-button:hover {
          transform: translateY(-1px);
        }

        .mentor-approve-button {
          background: #6d28d9;
          color: white;
        }

        .mentor-approve-button:hover {
          background: #5b21b6;
        }

        .mentor-reject-button {
          border: 1px solid #fecaca;
          background: white;
          color: #b91c1c;
        }

        .mentor-reject-button:hover {
          background: #fef2f2;
        }
      `}</style>

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-violet-600">
            Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Mentor Requests
          </h1>
          <p className="mt-2 text-slate-500">
            Review applications from members who want to become mentors.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
            Loading mentor requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-2xl text-violet-700">
              ✓
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              No mentor requests
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              New applications will appear here when members apply.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
              <p className="font-semibold text-slate-700">
                Applications
              </p>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                {requests.length}{" "}
                {requests.length === 1 ? "Request" : "Requests"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {requests.map((request) => (
                <div className="mentor-request-card" key={request._id}>
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-100 text-lg font-bold text-violet-700">
                        {(request.user?.name ||
                          request.user?.email ||
                          "M")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h2 className="break-words text-lg font-bold text-slate-900">
                          {request.user?.name ||
                            request.user?.email ||
                            "Unknown User"}
                        </h2>
                        <p className="break-all text-sm text-slate-500">
                          {request.user?.email}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`mentor-request-status ${request.status}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        Current role
                      </span>
                      <span className="text-sm font-semibold capitalize text-slate-800">
                        {request.user?.role || "Unknown"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        Request status
                      </span>
                      <span className="text-sm font-semibold capitalize text-slate-800">
                        {request.status}
                      </span>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="mentor-action-button mentor-approve-button"
                        onClick={() => handleApprove(request._id)}
                      >
                        Approve Request
                      </button>

                      <button
                        type="button"
                        className="mentor-action-button mentor-reject-button"
                        onClick={() => handleReject(request._id)}
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MentorRequests;
