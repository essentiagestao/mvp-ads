import { processUploadQueue, db } from '../components/mediaQueue';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

vi.mock('react-toastify', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() }
}));

const originalFetch = global.fetch;

describe('processUploadQueue', () => {
  beforeEach(() => {
    (global as any).fetch = vi.fn().mockResolvedValue({ ok: false });
  });

  afterEach(() => {
    (global as any).fetch = originalFetch;
  });

  it('marks failed uploads as failed', async () => {
    const pendingItem = {
      id: 1,
      file: new ArrayBuffer(1),
      type: 'image' as const,
      name: 'img.png',
      size: 1,
      status: 'pending' as const,
      createdAt: 0,
    };

    const update = vi.fn();
    const del = vi.fn();
    const toArray = vi.fn().mockResolvedValue([pendingItem]);
    const equals = vi.fn(() => ({ toArray }));
    const where = vi.fn(() => ({ equals }));

    const originalQueue = db.uploadQueue;
    db.uploadQueue = { where, update, delete: del } as any;

    await processUploadQueue();

    expect(update).toHaveBeenCalledWith(1, { status: 'uploading' });
    expect(update).toHaveBeenCalledWith(1, { status: 'failed' });
    expect(del).not.toHaveBeenCalled();

    db.uploadQueue = originalQueue;
  });
});
