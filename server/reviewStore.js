import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORE = path.resolve('server/data/review_invites.json');

function readStore() {
  try { return JSON.parse(fs.readFileSync(STORE, 'utf8')); } catch { return { invites: [] }; }
}
function writeStore(value) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  const tmp = `${STORE}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, STORE);
}
function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }

export function createReviewInvite({ project, ownerId, email, scope = 'executive', days = 7 }) {
  const raw = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + Math.min(30, Math.max(1, Number(days) || 7)) * 86400000).toISOString();
  const invite = {
    id: `rev_${crypto.randomBytes(8).toString('hex')}`, tokenHash: hashToken(raw),
    projectType: project.type, projectId: project.id, projectPath: project.path,
    ownerId, email: String(email || '').trim().toLowerCase(), scope,
    createdAt: now.toISOString(), expiresAt, revokedAt: null, comments: []
  };
  const data = readStore(); data.invites = data.invites.filter(x => x.projectPath !== project.path || x.revokedAt);
  data.invites.push(invite); writeStore(data);
  return { invite: { ...invite, tokenHash: undefined }, token: raw };
}
export function getReviewInvite(token) {
  if (!token) return null;
  const invite = readStore().invites.find(x => x.tokenHash === hashToken(token));
  if (!invite || invite.revokedAt || Date.parse(invite.expiresAt) <= Date.now()) return null;
  return invite;
}
export function addReviewComment(token, input) {
  const data = readStore(); const invite = data.invites.find(x => x.tokenHash === hashToken(token));
  if (!invite || invite.revokedAt || Date.parse(invite.expiresAt) <= Date.now()) return null;
  const comment = { id: `c_${crypto.randomBytes(8).toString('hex')}`, createdAt: new Date().toISOString(),
    status: 'open', authorEmail: invite.email, text: String(input.text || '').trim(),
    anchor: input.anchor || null, revision: input.revision || null };
  if (!comment.text) return null;
  invite.comments.push(comment); writeStore(data); return comment;
}
export function listReviewComments(token) { const invite = getReviewInvite(token); return invite?.comments || null; }
export function revokeReviewInvite(id, actorId) {
  const data = readStore(); const invite = data.invites.find(x => x.id === id && x.ownerId === actorId);
  if (!invite) return false; invite.revokedAt = new Date().toISOString(); writeStore(data); return true;
}
