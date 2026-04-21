import { useEffect, useMemo, useState } from 'react';
import AppModal from '../../components/AppModal';
import AppToast from '../../components/AppToast';
import api, { getApiErrorPayload } from '../../services/api';

const emptyQuizForm = {
  title: '',
  description: '',
  questions: [],
};

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', variant: 'danger' });
  const [formData, setFormData] = useState(emptyQuizForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const showToast = (message, variant = 'danger') => {
    setToast({ message, variant });
  };

  const clearToast = () => {
    setToast({ message: '', variant: 'danger' });
  };

  const questionOptions = useMemo(
    () =>
      questions.map((question) => ({
        value: question._id,
        label: question.text,
      })),
    [questions]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [quizRes, questionRes] = await Promise.all([api.get('/quizzes'), api.get('/questions')]);
      setQuizzes(quizRes.data.data || []);
      setQuestions(questionRes.data.data || []);
    } catch (err) {
      showToast(getApiErrorPayload(err, 'Cannot load quizzes').message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setFormData(emptyQuizForm);
    setEditingId(null);
    clearToast();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      clearToast();
      if (editingId) {
        await api.put(`/quizzes/${editingId}`, formData);
        await loadData();
        resetForm();
        showToast('Question list of quiz updated successfully.', 'success');
      } else {
        await api.post('/quizzes', formData);
        await loadData();
        resetForm();
        showToast('Quiz created successfully.', 'success');
      }
    } catch (err) {
      showToast(getApiErrorPayload(err, 'Save quiz failed').message);
    }
  };

  const handleEdit = (quiz) => {
    clearToast();
    setEditingId(quiz._id);
    setFormData({
      title: quiz.title || '',
      description: quiz.description || '',
      questions: quiz.questions?.map((question) => question._id) || [],
    });
  };

  const toggleQuestion = (questionId) => {
    setFormData((prev) => {
      const isSelected = prev.questions.includes(questionId);
      return {
        ...prev,
        questions: isSelected
          ? prev.questions.filter((id) => id !== questionId)
          : [...prev.questions, questionId],
      };
    });
    clearToast();
  };

  const handleDelete = async (quizId) => {
    const confirmed = window.confirm('Delete this quiz?');
    if (!confirmed) {
      return;
    }

    try {
      clearToast();
      await api.delete(`/quizzes/${quizId}`);
      setQuizzes((prev) => prev.filter((quiz) => quiz._id !== quizId));
      showToast('Quiz deleted successfully.', 'success');
    } catch (err) {
      showToast(getApiErrorPayload(err, 'Delete quiz failed').message);
    }
  };

  return (
    <div className="container py-4">
      <AppToast message={toast.message} variant={toast.variant} onClose={clearToast} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Quan ly Quiz</h2>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Cap nhat Quiz' : 'Tao Quiz moi'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                className="form-control"
                value={formData.title}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, title: e.target.value }));
                  clearToast();
                }}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="2"
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, description: e.target.value }));
                  clearToast();
                }}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Questions</label>
              <div className="border rounded p-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {questionOptions.map((option) => (
                  <div className="form-check" key={option.value}>
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`question-${option.value}`}
                      checked={formData.questions.includes(option.value)}
                      onChange={() => toggleQuestion(option.value)}
                    />
                    <label className="form-check-label" htmlFor={`question-${option.value}`}>
                      {option.label}
                    </label>
                  </div>
                ))}
                {questionOptions.length === 0 && (
                  <div className="text-muted">Chua co cau hoi nao.</div>
                )}
              </div>
              <div className="form-text">Da chon {formData.questions.length} cau hoi.</div>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" type="submit">
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white">
          <h5 className="mb-0">Danh sach Quiz</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Questions</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && quizzes.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-muted">
                    Chua co quiz nao.
                  </td>
                </tr>
              )}
              {quizzes.map((quiz) => (
                <tr key={quiz._id}>
                  <td>{quiz.title}</td>
                  <td className="text-muted">{quiz.description}</td>
                  <td>{quiz.questions?.length || 0}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => setSelectedQuiz(quiz)}
                    >
                      View
                    </button>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(quiz)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(quiz._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedQuiz && (
        <AppModal
          show={Boolean(selectedQuiz)}
          title="Chi tiet Quiz"
          size="lg"
          onClose={() => setSelectedQuiz(null)}
          footer={
            <button type="button" className="btn btn-secondary" onClick={() => setSelectedQuiz(null)}>
              Close
            </button>
          }
        >
          <h5 className="mb-1">{selectedQuiz.title}</h5>
          <p className="text-muted mb-3">{selectedQuiz.description}</p>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">Questions</h6>
            <span className="badge text-bg-dark">{(selectedQuiz.questions || []).length} cau hoi</span>
          </div>
          <ul className="list-group">
            {(selectedQuiz.questions || []).map((question) => (
              <li className="list-group-item" key={question._id || question}>
                {question.text || question}
              </li>
            ))}
            {(selectedQuiz.questions || []).length === 0 && (
              <li className="list-group-item text-muted">Chua co cau hoi nao.</li>
            )}
          </ul>
        </AppModal>
      )}
    </div>
  );
};

export default ManageQuizzes;
