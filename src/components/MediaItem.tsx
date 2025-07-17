import React from 'react';
import { IUploadQueueItem } from './mediaQueue';

interface Props {
  item: IUploadQueueItem;
}

const MediaItem: React.FC<Props> = ({ item }) => {
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(new Blob([item.file]));
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
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
