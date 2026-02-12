'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

type MenuCardProps = {
  name: string;
  price: number;
  imageUrl?: string;
  onClick?: () => void;
  className?: string;
};

export function MenuCard({ name, price, imageUrl, onClick, className }: MenuCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-primary-300 hover:shadow',
        className
      )}
    >
      {imageUrl && (
        <div className="relative mb-3 aspect-video overflow-hidden rounded-md bg-gray-100">
          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      )}
      <h3 className="font-medium text-gray-900">{name}</h3>
      <p className="mt-1 text-primary-600">₩{price.toLocaleString()}</p>
    </button>
  );
}
