import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography, Paper, Box, Button, Alert, Chip, List, ListItem, ListItemText,
  Divider,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import api, { CourseItem, LabSubmission, uploadUrl } from '../api';
import { useAuth } from '../context/AuthContext';

export default function LabPage() {
  const { user } = useAuth();
  const { itemId } = useParams<{ itemId: string }>();
  const [item, setItem] = useState<CourseItem | null>(null);
  const [submission, setSubmission] = useState<LabSubmission | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => {
    if (!itemId) return;
    api.get<CourseItem>(`/course-items/${itemId}`).then((r) => setItem(r.data));
    api.get<LabSubmission | null>(`/labs/my/${itemId}`).then((r) => setSubmission(r.data));
  };

  useEffect(() => { load(); }, [itemId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !itemId) return;
    setUploading(true);
    setMessage('');
    const form = new FormData();
    form.append('file', file);
    try {
      await api.post(`/labs/submit/${itemId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Работа успешно отправлена!');
      load();
    } catch {
      setMessage('Ошибка загрузки файла');
    } finally {
      setUploading(false);
    }
  };

  if (!item) return <Typography>Загрузка...</Typography>;

  const myTeam = item.teams?.find((t) =>
    t.members.some((m) => m.student.id === user?.id)
  );

  return (
    <Box>
      <Button component={Link} to={`/subject/${item.subjectId}`} size="small" sx={{ mb: 1 }}>
        ← Назад к предмету
      </Button>
      <Typography variant="h5" gutterBottom>{item.title}</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>{item.description}</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Информация</Typography>
        <List dense>
          <ListItem>
            <ListItemText
              primary="Дата выдачи"
              secondary={new Date(item.issuedAt).toLocaleDateString('ru-RU')}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Дедлайн"
              secondary={item.deadline ? new Date(item.deadline).toLocaleDateString('ru-RU') : 'Не указан'}
            />
          </ListItem>
          <ListItem>
            <ListItemText primary="Максимальный балл" secondary={item.maxScore} />
          </ListItem>
          {item.isTeamWork && (
            <ListItem>
              <ListItemText
                primary="Напарники"
                secondary={
                  myTeam
                    ? myTeam.members.map((m) => `${m.student.lastName} ${m.student.firstName}`).join(', ')
                    : 'Команда не назначена'
                }
              />
            </ListItem>
          )}
        </List>
        {item.taskFile && (
          <Button
            startIcon={<DownloadIcon />}
            href={uploadUrl(item.taskFile)}
            target="_blank"
            variant="outlined"
            size="small"
          >
            Скачать ТЗ
          </Button>
        )}
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom>Ваше решение</Typography>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {submission?.submittedAt ? (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="body2">
            Сдано: {new Date(submission.submittedAt).toLocaleString('ru-RU')}
          </Typography>
          {submission.filePath && (
            <Button href={uploadUrl(submission.filePath)} target="_blank" size="small" sx={{ mt: 1 }}>
              Скачать файл
            </Button>
          )}
          {submission.grade !== null && (
            <Chip label={`Оценка: ${submission.grade}`} color="primary" sx={{ mt: 1, ml: 1 }} />
          )}
          {submission.teacherComment && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Комментарий преподавателя: {submission.teacherComment}
            </Alert>
          )}
          <Chip label={submission.status} size="small" sx={{ mt: 1, display: 'block', width: 'fit-content' }} />
        </Paper>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Работа ещё не сдана
        </Typography>
      )}

      <input type="file" ref={fileRef} hidden onChange={handleUpload} accept=".pdf,.zip,.doc,.docx,.txt,.md" />
      <Button
        variant="contained"
        startIcon={<UploadFileIcon />}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Загрузка...' : submission?.submittedAt ? 'Пересдать работу' : 'Прикрепить решение'}
      </Button>
    </Box>
  );
}
