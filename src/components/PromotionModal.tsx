import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { ScrollReveal } from '@/components/ScrollReveal';
import { Sparkles, Send, CheckCircle2 } from 'lucide-react';

export function PromotionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    channel: '',
    course_link: '',
    budget: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.channel) {
      setError('Please fill in your name and channel.');
      return;
    }
    setSubmitting(true);
    setError('');

    const { error: insertError } = await supabase.from('promotions').insert({
      name: form.name,
      channel: form.channel,
      course_link: form.course_link,
      budget: form.budget,
      message: form.message,
    });

    if (insertError) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    setForm({ name: '', channel: '', course_link: '', budget: '', message: '' });
  };

  const handleClose = () => {
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Creator Collaboration" maxWidth="max-w-xl">
      {submitted ? (
        <div className="text-center py-8">
          <div className="inline-flex p-4 rounded-2xl bg-neon-emerald/10 mb-4">
            <CheckCircle2 className="h-12 w-12 text-neon-emerald" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Request Received!</h3>
          <p className="text-sm text-white/60 mb-6 max-w-sm mx-auto">
            Thanks for your interest in collaborating with Lumina. Our team will review your
            request and get back to you within 48 hours.
          </p>
          <Button variant="ghost" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-neon-emerald/5 border border-neon-emerald/15">
            <Sparkles className="h-5 w-5 text-neon-emerald flex-shrink-0 mt-0.5" />
            <p className="text-sm text-white/70 leading-relaxed">
              Want to feature your course on Lumina? Share your details and our team will reach
              out to discuss collaboration opportunities.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Name *"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
              <Field
                label="Channel / Brand"
                name="channel"
                value={form.channel}
                onChange={handleChange}
                placeholder="@yourchannel"
              />
              <Field
                label="Course Link"
                name="course_link"
                value={form.course_link}
                onChange={handleChange}
                placeholder="https://youtube.com/watch?v=..."
              />
              <Field
                label="Budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="$500 - $1,000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={3}
                placeholder="Tell us about your course and goals..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50 focus:bg-white/8 transition-all resize-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full" size="lg">
              <Send className="h-4 w-4" />
              {submitting ? 'Sending...' : 'Submit Request'}
            </Button>
          </form>
        </>
      )}
    </Modal>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/80 mb-1.5">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-neon-indigo/50 focus:bg-white/8 transition-all"
      />
    </div>
  );
}

export function PromotionSection({ onPromoteClick }: { onPromoteClick: () => void }) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <ScrollReveal direction="up">
          <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12 text-center">
            <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-neon-emerald/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-neon-indigo/20 blur-3xl" />
            <div className="relative">
              <div className="inline-flex p-3 rounded-2xl bg-neon-emerald/10 border border-neon-emerald/20 mb-4">
                <Sparkles className="h-6 w-6 text-neon-emerald" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Are you a <span className="text-gradient-emerald">Creator</span>?
              </h2>
              <p className="text-white/60 max-w-xl mx-auto mb-8 leading-relaxed">
                Feature your courses on Lumina and reach thousands of motivated learners. Submit
                your details and our team will help you get started.
              </p>
              <Button variant="secondary" size="lg" onClick={onPromoteClick}>
                <Sparkles className="h-4 w-4" />
                Promote with Us
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
