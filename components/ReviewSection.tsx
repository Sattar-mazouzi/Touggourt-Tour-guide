
import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../i18n';
import { Language, Review } from '../types';
import { db } from '../firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

interface Props {
  placeId: string;
  lang: Language;
}

const ReviewSection: React.FC<Props> = ({ placeId, lang }) => {
  const { user, submitReview } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const t = translations;

  const fetchReviews = async () => {
    try {
      // Simplied query to avoid requiring a composite index in Firestore.
      // Firestore single-field indexes are automatic.
      const q = query(
        collection(db, 'reviews'),
        where('placeId', '==', placeId),
        limit(50) // Fetch a reasonable number to sort in-memory
      );
      
      const snap = await getDocs(q);
      const allReviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      
      // Sort newest first and take the top 5 in-memory.
      // This is performant for small-to-medium review sets and bypasses index errors.
      const sorted = allReviews
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 5);
        
      setReviews(sorted);
    } catch (error: any) {
      if (error.code === 'permission-denied') {
        console.warn("Firestore Reviews Fetch: Permission denied. Check Security Rules for 'reviews' collection.");
      } else if (error.code === 'failed-precondition') {
        // This is where index errors are usually reported.
        console.warn("Firestore Reviews Fetch: Precondition failed (possibly index required). Falling back to empty state.");
      } else {
        console.error("Firestore Reviews Error:", error);
      }
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [placeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;
    setSubmitting(true);
    try {
      await submitReview(placeId, rating, comment);
      setComment('');
      setRating(5);
      await fetchReviews();
    } catch (err) {
      // Error is handled in AuthContext but we catch it here to stop the spinner
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 mt-10">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900">{t.reviews[lang]}</h3>
        {!user && <p className="text-xs text-orange-500 font-bold">{t.loginRequired[lang]}</p>}
      </div>

      {user && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                className={`p-1 transition-transform active:scale-125 ${rating >= s ? 'text-yellow-500' : 'text-slate-300'}`}
              >
                <Star size={24} fill={rating >= s ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <textarea
            required
            className="w-full p-4 bg-white border border-slate-100 rounded-2xl text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-orange-500/20"
            placeholder={t.leaveReview[lang]}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            disabled={submitting}
            type="submit"
            className="mt-4 w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
          >
            {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
            {t.submit[lang]}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="flex gap-4 p-4">
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                <User size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{r.userName}</span>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-slate-700">{r.rating}</span>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 text-xs italic py-4">
            {user ? "No reviews yet. Be the first to share your experience!" : "Sign in to view or write reviews."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
