import { render, screen, fireEvent } from '@testing-library/react';
import CampaignAudience from '../components/Campaign/CampaignAudience';
import { vi } from 'vitest';

defineGlobals();

vi.mock('../components/mediaQueue', () => ({}));

function defineGlobals() {}

describe('CampaignAudience', () => {
  it('calls onChange with updated audience id', () => {
    const handleChange = vi.fn();
    render(<CampaignAudience audienceId="123" onChange={handleChange} />);

    const input = screen.getByLabelText(/Audience ID/i);
    fireEvent.change(input, { target: { value: '456' } });

    expect(handleChange).toHaveBeenCalledWith('456');
  });
});
