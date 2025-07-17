import { render, screen, fireEvent } from '@testing-library/react';
import UploadQueue from '../components/UploadQueue';
import { vi } from 'vitest';
import { processUploadQueue, db } from '../components/mediaQueue';
import { liveQuery } from 'dexie';

defineGlobals();

vi.mock('../components/mediaQueue', () => {
  const mockItems = [
    {
      id: 1,
      name: 'file1',
      type: 'image',
      status: 'pending',
      size: 10,
      file: new ArrayBuffer(1),
      createdAt: 0,
    },
    {
      id: 2,
      name: 'file2',
      type: 'image',
      status: 'failed',
      size: 20,
      file: new ArrayBuffer(1),
      createdAt: 0,
    },
  ];
  return {
    db: {
      uploadQueue: {
        toArray: vi.fn(() => mockItems),
        delete: vi.fn(),
      },
    },
    processUploadQueue: vi.fn(),
  };
});

vi.mock('dexie', () => {
  return {
    liveQuery: (fn: any) => {
      return {
        subscribe({ next }: any) {
          Promise.resolve(fn()).then(next);
          return { unsubscribe: vi.fn() };
        },
      };
    },
  };
});

function defineGlobals() {
  // Vitest with jsdom sets these globals automatically when globals: true is enabled
}

describe('UploadQueue', () => {
  it('processes queue when publish button is clicked', async () => {
    render(<UploadQueue />);
    const button = await screen.findByRole('button', { name: /Publicar Mudanças/i });
    fireEvent.click(button);
    expect(processUploadQueue).toHaveBeenCalled();
  });

  it('retries failed items and cancels pending', async () => {
    render(<UploadQueue />);
    const retry = await screen.findByRole('button', { name: /Reenviar/i });
    fireEvent.click(retry);
    expect(processUploadQueue).toHaveBeenCalled();

    const cancelButtons = screen.getAllByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButtons[0]);
    expect(db.uploadQueue.delete).toHaveBeenCalledWith(1);
  });
});
