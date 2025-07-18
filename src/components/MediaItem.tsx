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
    <div className="flex flex-col items-center space-y-2">
      {item.type === 'image' ? (
        <img src={url} alt={item.name} className="max-w-full" />
      ) : (
        <video src={url} controls className="w-48" />
      )}
      <p className="text-sm text-center">{item.name}</p>
    </div>
  );
};

export default MediaItem;
