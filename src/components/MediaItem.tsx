import React from 'react';
import { IUploadQueueItem } from '../__legacy/mediaQueue-exports';

interface Props {
  item: IUploadQueueItem;
}

const MediaItem: React.FC<Props> = ({ item }) => {
  const url = React.useMemo(() => {
    return URL.createObjectURL(new Blob([item.file]));
  }, [item.file]);

  return (
    <div className="media-item">
      {item.type === 'image' ? (
        <img src={url} alt={item.name} />
      ) : (
        <video src={url} controls width={200} />
      )}
      <p>{item.name}</p>
    </div>
  );
};

export default MediaItem;
