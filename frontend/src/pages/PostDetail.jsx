// src/pages/PostDetail.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { CategoriesContext } from "../context/CategoriesContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Avatar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RateReviewIcon from "@mui/icons-material/RateReview";
import SendIcon from "@mui/icons-material/Send";


const API = import.meta.env.VITE_API_BASE_URL || "/api/";

const ASPECTS = [
  { key: "composition", label: "Composición" },
  { key: "clarity_focus", label: "Claridad y enfoque" },
  { key: "lighting", label: "Iluminación" },
  { key: "creativity", label: "Creatividad" },
  { key: "technical_adaptation", label: "Adaptación técnica" },
];

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { categories } = useContext(CategoriesContext);
  const authToken =  localStorage.getItem("access");

  const [post, setPost] = useState({
    author: {},
    image: null,
    title: "",
    description: "",
    created_at: "",
    allows_ratings: false,
    ratings_count: 0,
  });
  const [loading, setLoading] = useState(true);

  // Comentarios
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  
  // Paginación de comentarios
  const [commentsPagination, setCommentsPagination] = useState({
    next: null,
    previous: null,
    count: 0,
    loadingMore: false
  });

  // Diálogos de confirmación
  const [deleteCommentDialog, setDeleteCommentDialog] = useState({
    open: false,
    commentId: null
  });
  const [deletePostDialog, setDeletePostDialog] = useState({
    open: false
  });

  // Ratings
  const [userHasRated, setUserHasRated] = useState(false);
  const [ratingsSummary, setRatingsSummary] = useState(null); // promedios y total
  const [openRateDialog, setOpenRateDialog] = useState(false);
  const [ratingValues, setRatingValues] = useState(
    ASPECTS.reduce((acc, a) => ({ ...acc, [a.key]: 3 }), {})
  );

  // Edit/Delete post
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // Notifications
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    if (!id) return;

    fetchPost(id);

  }, [id]);

  // useEffect separado para checkIfUserRated que depende de user
  useEffect(() => {
    if (!id || !user) return;
    
    checkIfUserRated(id);
  }, [id, user]);

  // ---------- Fetch post + comments + ratings ----------
  const fetchPost = async (postId) => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}posts/${postId}/`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      const data = res.data.data;
      setPost(data);

      fetchComments(postId);
      fetchRatingsSummary(postId);


    } catch (err) {
      setSnack({ open: true, message: "Error al cargar la publicación", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const loadMoreComments = async () => {
    if (!commentsPagination.next || commentsPagination.loadingMore) return;
    
    setCommentsPagination(prev => ({ ...prev, loadingMore: true }));
    
    // Extraer el número de página de la URL next
    const nextPage = new URLSearchParams(commentsPagination.next.split('?')[1]).get('page');
    const pageNumber = nextPage ? parseInt(nextPage) : 2;
    
    await fetchComments(id, pageNumber, true);
  };

  const fetchComments = async (postId, page = 1, append = false) => {
    try {
      const res = await axios.get(`${API}posts/${postId}/comments/?page=${page}`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      
      const commentsData = res.data.results ?? res.data ?? [];
      
      if (append) {
        // Agregar comentarios a los existentes
        setComments(prev => [...prev, ...commentsData]);
      } else {
        // Reemplazar comentarios (primera carga)
        setComments(commentsData);
      }
      
      // Actualizar información de paginación
      setCommentsPagination(prev => ({
        next: res.data.next,
        previous: res.data.previous,
        count: append ? prev.count : (res.data.count || commentsData.length),
        loadingMore: false
      }));
      
    } catch (err) {
      if (!append) {
        setComments([]);
      }
      setCommentsPagination(prev => ({ ...prev, loadingMore: false }));
    }
  };

  const fetchRatingsSummary = async (postId) => {
    try {
      const res = await axios.get(`${API}posts/${postId}/ratings/averages/`, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });
      
      if (res.data?.success){
        setRatingsSummary(res.data.data);
      } else {
        setRatingsSummary(null);
      }
    } catch (err) {
      setRatingsSummary(null);
    }
  };

  const checkIfUserRated = async (postId) => {
    if (!authToken || !user) {
      setUserHasRated(false);
      return;
    }
    try {
      const res = await axios.get(`${API}ratings/?post_id=${postId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data?.success) {
        setUserHasRated(true);

        // Pre-cargar valores en ratingValues para mostrar estrellas
        const userRating = res.data.data;
        setRatingValues({
          composition: userRating.composition,
          clarity_focus: userRating.clarity_focus,
          lighting: userRating.lighting,
          creativity: userRating.creativity,
          technical_adaptation: userRating.technical_adaptation,
        });
      } else {
        setUserHasRated(false);
      }
    } catch (err) {
      setUserHasRated(false);
    }
  };

  // ---------- Commentarios ----------
  const handleCreateComment = async () => {
    if (!newComment.trim()) return;
    setCommentLoading(true);
    try {
      const res = await axios.post(
        `${API}posts/${id}/comments/`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      // backend responde con el comment creado
      setComments((p) => [res.data.data, ...p]);
      setCommentsPagination(prev => ({
        ...prev,
        count: prev.count + 1
      }));
      setNewComment("");
      setSnack({ open: true, message: "Comentario publicado", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: "Error al publicar comentario", severity: "error" });
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Abrir diálogo de confirmación
    setDeleteCommentDialog({
      open: true,
      commentId: commentId
    });
  };

  const confirmDeleteComment = async () => {
    const { commentId } = deleteCommentDialog;
    
    try {
      await axios.delete(`${API}posts/${id}/comments/${commentId}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setComments((p) => p.filter((c) => c.id !== commentId));
      // Actualizar el contador de comentarios
      setCommentsPagination(prev => ({
        ...prev,
        count: Math.max(0, prev.count - 1)
      }));
      setSnack({ open: true, message: "Comentario eliminado", severity: "info" });
    } catch (err) {
      setSnack({ open: true, message: "Error al eliminar comentario", severity: "error" });
    } finally {
      setDeleteCommentDialog({ open: false, commentId: null });
    }
  };

  const handleEditComment = async (commentId, newText) => {
    try {
      const res = await axios.put(
        `${API}posts/${id}/comments/${commentId}/`,
        { content: newText },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setComments((p) => p.map((c) => (c.id === commentId ? res.data.data : c)));
      setSnack({ open: true, message: "Comentario editado", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: "No se pudo editar comentario", severity: "error" });
    }
  };

  // ---------- Valoraciones ----------
  const handleOpenRate = () => {
    setRatingValues(ASPECTS.reduce((acc, a) => ({ ...acc, [a.key]: 3 }), {}));
    setOpenRateDialog(true);
  };

  const handleSubmitRating = async () => {
    if (!post.id) return;

    const payload = {
      post: post.id,
      composition: ratingValues.composition,
      clarity_focus: ratingValues.clarity_focus,
      lighting: ratingValues.lighting,
      creativity: ratingValues.creativity,
      technical_adaptation: ratingValues.technical_adaptation,

    };

    try {
      const res = await axios.post(`${API}ratings/`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setOpenRateDialog(false);
      setUserHasRated(true);

      // Recalcular resumen
      await fetchRatingsSummary(post.id);
      setSnack({ open: true, message: "Gracias por valorar", severity: "success" });
    } catch (err) {

      setSnack({ open: true, message: err.response?.data?.message || "No se pudo enviar la valoración", severity: "error" });
    }
  };

  // ---------- Editar/Eliminar publicación ----------
  const handleOpenEdit = () => {
    setEditTitle(post.title || "");
    setEditDescription(post.description || "");
    setOpenEditDialog(true);
  };

  const handleSubmitEdit = async () => {
    try {
      const res = await axios.put(
        `${API}posts/${id}/`,
        { title: editTitle, description: editDescription },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setPost(res.data.data);
      setOpenEditDialog(false);
      setSnack({ open: true, message: "Publicación actualizada", severity: "success" });
    } catch (err) {
      setSnack({ open: true, message: "Error al actualizar publicación", severity: "error" });
    }
  };

  const handleDeletePost = async () => {
    // Abrir diálogo de confirmación
    setDeletePostDialog({ open: true });
  };

  const confirmDeletePost = async () => {
    try {
      await axios.delete(`${API}posts/${id}/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      // Mostrar snackbar de confirmación
      setSnack({ 
        open: true, 
        message: "¡Publicación eliminada correctamente!", 
        severity: "success" 
      });
      
      // Redirigir al perfil después de 2 segundos
      setTimeout(() => {
        navigate("/Perfil");
      }, 2000);
      
    } catch (err) {
      setSnack({ 
        open: true, 
        message: "No se pudo eliminar la publicación", 
        severity: "error" 
      });
    } finally {
      setDeletePostDialog({ open: false });
    }
  };

  // ---------- Helpers ----------
  const isAuthor = () => {
    if (!post || !user) return false;
    return post.author?.id === user.id || post.author?.username === user.username;
  };

  const getCategoryName = () => {
    if (!post.category || !categories || categories.length === 0) return null;
    
    // Si post.category es un objeto con name, usarlo directamente
    if (typeof post.category === 'object' && post.category.name) {
      return post.category.name;
    }
    
    // Si post.category es solo un ID, buscar en las categorías
    if (typeof post.category === 'number' || typeof post.category === 'string') {
      const category = categories.find(c => c.id === Number(post.category));
      return category ? category.name : null;
    }
    
    return null;
  };


  const renderRatingAverages = () => {
    // Si la publicación no permite valoraciones, no mostrar nada
    if (!post.allows_ratings) {
      return null;
    }

    if (!ratingsSummary) {
      return <Typography variant="body2">Sin valoraciones aún</Typography>;
    }

    const averages = ratingsSummary;
    const total = averages.total_ratings ?? 0;

    // Si no hay valoraciones (total_ratings es 0), mostrar mensaje
    if (Number(total) === 0) {
      return <Typography variant="body2">Sin valoraciones aún</Typography>;
    }
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={1}>
          <Typography variant="subtitle2">Valoraciones ({total})</Typography>
          <Typography variant="body2" color="text.secondary">
            Promedio: {(Number(averages.overall ?? 0)).toFixed(1)}/5
          </Typography>
        </Box>
        
        {/* Aspectos individuales */}
        {ASPECTS.map((a) => (
          <Box key={a.key} display="flex" alignItems="center" gap={1} mt={1}>
            <Typography variant="body2" sx={{ width: 130 }}>
              {a.label}
            </Typography>

            <Rating
              value={Number(averages[a.key] ?? 0)}
              precision={0.1}
              readOnly
            />
            
            <Typography variant="body2" sx={{ ml: 1 }}>
              {(Number(averages[a.key] ?? 0)).toFixed(1)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  };

  // ---------- Renderizado ----------
  if (loading) return <Typography> Cargando publicación... </Typography>;
  if (!post) return <Typography> Publicación no encontrada. </Typography>;

  return (
    <>
      <Navbar />
      <Box sx={{ maxWidth: 800, margin: "1.5rem auto", px: 2 }}>
      {/* HEADER / CARD */}
      <Card>
        {post.image && (
          <CardMedia
            component="img"
            image={post.image}
            alt={post.title || "Publicación"}
            sx={{
              width: '100%',
              height: 'auto',
              objectFit: 'scale-down',
              maxHeight: '400px'
            }}
          />
        )}
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={post.author?.profile_pic || ""} alt={post.author?.username || "Autor" } />
              <Box>
                {post.title && (
                  <Typography variant="h6">
                    {post.title}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Por {post.author?.username || "Desconocido"} · {" "}
                  {getCategoryName() && (
                    <span>
                      {getCategoryName()}
                    </span>
                  )} · {" "}
                  {post.uploaded_at ? new Date(post.uploaded_at).toLocaleDateString('es-ES') : "Fecha desconocida"}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" alignItems="center" gap={1}>
              {/* edit/delete solo visible para autor */}
              {isAuthor() && (
                <>
                  <IconButton size="small" onClick={handleOpenEdit}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={handleDeletePost}><DeleteIcon /></IconButton>
                </>
              )}

              {/* Rating: si no es autor, no ha valorado, permite valoraciones y está logueado, puede valorar */}
              {!isAuthor() && !userHasRated && user && post.allows_ratings && (
                <Button variant="contained" startIcon={<RateReviewIcon />} onClick={handleOpenRate}>
                  Valorar
                </Button>
              )}
              
              {/* Mensaje cuando la publicación no permite valoraciones */}
              {!isAuthor() && user && !post.allows_ratings && (
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <RateReviewIcon fontSize="small" />
                  Esta publicación no permite valoraciones
                </Typography>
              )}
              
              {/* Indicador cuando el usuario ya valoró */}
              {!isAuthor() && userHasRated && user && post.allows_ratings && (
                <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  ✓ Ya valoraste esta publicación
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {post.description ? (
            <Typography variant="body1" color="text.secondary" paragraph sx={{ textAlign: 'justify' }}>{post.description}</Typography>
          ) : null}

          {/* ratings summary compact (en caso de que arriba no se muestre) */}
          <Box mt={2}>{renderRatingAverages()}</Box>
        </CardContent>
      </Card>

      {/* Area de comentarios */}
      <Box mt={3}>
        <Typography variant="h6" color="text.primary">Comentarios</Typography>

        {/* Nuevo comentario */}
        {user ? (
          <Box display="flex" gap={1} mt={1}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribí un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button variant="contained" endIcon={<SendIcon />} onClick={handleCreateComment} disabled={commentLoading}>
              Enviar
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary" mt={1}>
            Iniciá sesión para comentar o puntuar publicaciones.
          </Typography>
        )}

        <Box mt={2}>
          {comments.length === 0 ? (
            <Typography color="text.secondary">Aún no hay comentarios.</Typography>
          ) : (
            <>
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUser={user}
                  onDelete={handleDeleteComment}
                  onEdit={handleEditComment}
                />
              ))}
              
              {/* Botón Ver más comentarios o mensaje de fin */}
              {commentsPagination.next ? (
                <Box display="flex" justifyContent="center" mt={2}>
                  <Button 
                    variant="outlined" 
                    onClick={loadMoreComments}
                    disabled={commentsPagination.loadingMore}
                    sx={{ minWidth: 120 }}
                  >
                    {commentsPagination.loadingMore ? "Cargando..." : "Ver más comentarios"}
                  </Button>
                </Box>
              ) : comments.length > 0 ? (
                <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                  Se han cargado todos los comentarios
                </Typography>
              ) : null}
            </>
          )}
        </Box>
      </Box>

      {/* -------- DIALOGS / MODALS -------- */}

      {/* Rate dialog */}
      <Dialog open={openRateDialog} onClose={() => setOpenRateDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Valorar publicación</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">Puntúa cada aspecto de 1 a 5 estrellas</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
            Nota: Solo puedes valorar esta publicación una vez.
          </Typography>
          <Box mt={2} display="grid" gap={2}>
            {ASPECTS.map((a) => (
              <Box key={a.key} display="flex" alignItems="center" justifyContent="space-between">
                <Typography color="text.secondary">{a.label}</Typography>
                <Rating
                  value={ratingValues[a.key]}
                  onChange={(e, val) => setRatingValues((p) => ({ ...p, [a.key]: val }))}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRateDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitRating}>Enviar valoración</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de edición de publicación (solo para autor) */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar publicación</DialogTitle>
        <DialogContent>
          <Box display="grid" gap={2} mt={1}>
            <TextField label="Título" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <TextField
              label="Descripción"
              multiline
              minRows={4}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSubmitEdit}>Guardar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación de comentario */}
      <Dialog 
        open={deleteCommentDialog.open} 
        onClose={() => setDeleteCommentDialog({ open: false, commentId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon color="error" />
          Eliminar comentario
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que querés eliminar este comentario?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteCommentDialog({ open: false, commentId: null })}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeleteComment} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación de eliminación de publicación */}
      <Dialog 
        open={deletePostDialog.open} 
        onClose={() => setDeletePostDialog({ open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DeleteIcon color="error" />
          Eliminar publicación
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que querés eliminar esta publicación?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer y se eliminarán todos los comentarios y valoraciones asociados.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeletePostDialog({ open: false })}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeletePost} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            Eliminar publicación
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={snack.open} 
        autoHideDuration={snack.message.includes("eliminada correctamente") ? 2000 : 3000} 
        onClose={() => setSnack((s) => ({ ...s, open:false }))}
      >
        <Alert severity={snack.severity} sx={{ width: "100%" }}>{snack.message}</Alert>
      </Snackbar>
    </Box>
    <Footer />
    </>
  );
}

/* ---------- Componente pequeño CommentItem dentro del mismo archivo ---------- */
function CommentItem({ comment, currentUser, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content || "");
  const [saving, setSaving] = useState(false);

  const canEdit = currentUser && (currentUser.id === comment.author?.id || currentUser.username === comment.author?.username);

  const handleSave = async () => {
    setSaving(true);
    await onEdit(comment.id, text);
    setSaving(false);
    setEditing(false);
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start", mt: 1 }}>
      <Avatar src={comment.author?.profile_pic || ""} alt={comment.author?.username} />
      <Box sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" color="text.primary">{comment.author?.username}</Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(comment.created_at).toLocaleDateString?.('es-ES') ?? comment.created_at}
          </Typography>
        </Box>

        {editing ? (
          <>
            <TextField fullWidth multiline minRows={2} value={text} onChange={(e) => setText(e.target.value)} />
            <Box display="flex" gap={1} mt={1}>
              <Button size="small" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>Guardar</Button>
            </Box>
          </>
        ) : (
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mt: 0.5 }}>
            <Typography variant="body2" sx={{ flex: 1, pr: 1, textAlign: 'justify', color: 'text.secondary' }}>{comment.content}</Typography>
            {canEdit && (
              <Box display="flex" gap={0.5}>
                <IconButton size="small" onClick={() => setEditing(true)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => onDelete(comment.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
