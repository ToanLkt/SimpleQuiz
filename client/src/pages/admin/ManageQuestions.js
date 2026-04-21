import { useEffect, useMemo, useState } from 'react';
import AppToast from '../../components/AppToast';
import api, { getApiErrorPayload } from '../../services/api';

const emptyQuestionForm = {
  text: '',
  optionsText: '',
  correctAnswerIndex: 0,
  keywordsText: '',
};

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', variant: 'danger' });
  const [formData, setFormData] = useState(emptyQuestionForm);
  const [editingId, setEditingId] = useState(null);

  const showToast = (message, variant = 'danger') => {
    setToast({ message, variant });
  };

  const clearToast = () => {
    setToast({ message: '', variant: 'danger' });
  };

  const optionsPreview = useMemo(() => {
    return formData.optionsText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  }, [formData.optionsText]);

  useEffect(() => {
    if (optionsPreview.length > 0 && formData.correctAnswerIndex >= optionsPreview.length) {
      setFormData((prev) => ({ ...prev, correctAnswerIndex: 0 }));
    }
  }, [optionsPreview.length, formData.correctAnswerIndex]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/questions');
      setQuestions(response.data.data || []);
    } catch (err) {
      showToast(getApiErrorPayload(err, 'Cannot load questions').message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const resetForm = () => {
    setFormData(emptyQuestionForm);
    setEditingId(null);
    clearToast();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const options = optionsPreview;
    if (options.length < 2) {
      showToast('Options phai co it nhat 2 dap an.');
      return;
    }

    if (formData.correctAnswerIndex < 0 || formData.correctAnswerIndex >= options.length) {
      showToast('Chi so dap an dung khong hop le.');
      return;
    }

    const payload = {
      text: formData.text,
      options,
      correctAnswerIndex: Number(formData.correctAnswerIndex),
      keywords: formData.keywordsText
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      clearToast();
      if (editingId) {
        await api.put(`/questions/${editingId}`, payload);
        await loadQuestions();
        resetForm();
        showToast('Question updated successfully.', 'success');
      } else {
        await api.post('/questions', payload);
        await loadQuestions();
        resetForm();
        showToast('Question created successfully.', 'success');
      }
    } catch (err) {
      showToast(getApiErrorPayload(err, 'Save question failed').message);
    }
  };

  const handleEdit = (question) => {
    clearToast();
    setEditingId(question._id);
    setFormData({
      text: question.text || '',
      optionsText: (question.options || []).join('\n'),
      correctAnswerIndex: question.correctAnswerIndex ?? 0,
      keywordsText: (question.keywords || []).join(', '),
    });
  };

  const handleDelete = async (questionId) => {
    const confirmed = window.confirm('Delete this question?');
    if (!confirmed) {
      return;
    }

    try {
      clearToast();
      await api.delete(`/questions/${questionId}`);
      setQuestions((prev) => prev.filter((question) => question._id !== questionId));
      showToast('Question deleted successfully.', 'success');
    } catch (err) {
      showToast(getApiErrorPayload(err, 'Delete question failed').message);
    }
  };

  return (
    <div className="container py-4">
      <AppToast message={toast.message} variant={toast.variant} onClose={clearToast} />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Quan ly Cau hoi</h2>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Cap nhat Cau hoi' : 'Tao Cau hoi moi'}</h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Question</label>
              <input
                className="form-control"
                value={formData.text}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, text: e.target.value }));
                  clearToast();
                }}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Options (each line is one option)</label>
              <textarea
                className="form-control"
                rows="4"
                value={formData.optionsText}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    optionsText: e.target.value,
                  }));
                  clearToast();
                }}
                required
              />
              <div className="form-text">Hien tai: {optionsPreview.length} option(s)</div>
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Correct Answer</label>
                <select
                  className="form-select"
                  value={formData.correctAnswerIndex}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      correctAnswerIndex: Number(e.target.value),
                    }));
                    clearToast();
                  }}
                  required
                >
                  {optionsPreview.length === 0 && <option value="0">Nhap options truoc</option>}
                  {optionsPreview.map((option, index) => (
                    <option key={`${option}-${index}`} value={index}>
                      {index}. {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Keywords (comma separated)</label>
                <input
                  className="form-control"
                  value={formData.keywordsText}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, keywordsText: e.target.value }));
                    clearToast();
                  }}
                />
              </div>
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
          <h5 className="mb-0">Danh sach Cau hoi</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Question</th>
                <th>Options</th>
                <th>Correct</th>
                <th>Author</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading && questions.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    Chua co cau hoi nao.
                  </td>
                </tr>
              )}
              {questions.map((question) => (
                <tr key={question._id}>
                  <td>{question.text}</td>
                  <td className="text-muted">
                    {(question.options || []).slice(0, 2).join(', ')}
                    {(question.options || []).length > 2 ? '...' : ''}
                  </td>
                  <td>{question.correctAnswerIndex}</td>
                  <td>{question.author?.username || 'N/A'}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(question)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(question._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions;
