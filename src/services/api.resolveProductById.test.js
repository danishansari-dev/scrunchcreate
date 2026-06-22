import { describe, expect, it } from 'vitest';
import { resolveProductById } from './api';

const sampleProducts = [
  {
    id: 'parent-1',
    _id: 'parent-1',
    name: 'Satin Scrunchie',
    color: 'red',
    image: 'parent.jpg',
    price: 40,
    offerPrice: 40,
    variants: [
      {
        id: 'variant-blue',
        _id: 'variant-blue',
        color: 'blue',
        images: ['variant-blue.jpg'],
        price: 45,
        offerPrice: 42,
      },
      {
        id: 'variant-green',
        color: 'green',
        images: [],
      },
    ],
  },
  {
    id: 'standalone-2',
    name: 'Hair Bow',
    color: 'pink',
    primaryImage: 'bow.jpg',
  },
];

describe('resolveProductById', () => {
  it('matches parent product by id', () => {
    const result = resolveProductById(sampleProducts, 'parent-1');

    expect(result).toEqual(sampleProducts[0]);
  });

  it('matches parent product by legacy _id', () => {
    const result = resolveProductById(sampleProducts, 'standalone-2');

    expect(result?.name).toBe('Hair Bow');
  });

  it('resolves variant id to hybrid product with parent fields preserved', () => {
    const result = resolveProductById(sampleProducts, 'variant-blue');

    expect(result).toMatchObject({
      id: 'variant-blue',
      name: 'Satin Scrunchie',
      color: 'blue',
      image: 'variant-blue.jpg',
      price: 45,
      offerPrice: 42,
    });
    expect(result.variants).toHaveLength(2);
  });

  it('falls back to parent image when variant has no images', () => {
    const result = resolveProductById(sampleProducts, 'variant-green');

    expect(result?.id).toBe('variant-green');
    expect(result?.image).toBe('parent.jpg');
  });

  it('resolves variant by legacy _id only', () => {
    const products = [
      {
        _id: 'legacy-parent',
        name: 'Legacy Product',
        image: 'parent.jpg',
        variants: [{ _id: 'legacy-variant', color: 'red', images: ['variant.jpg'] }],
      },
    ];

    const result = resolveProductById(products, 'legacy-variant');

    expect(result?.id).toBe('legacy-variant');
    expect(result?.color).toBe('red');
    expect(result?.name).toBe('Legacy Product');
  });

  it('returns null when id is not found', () => {
    expect(resolveProductById(sampleProducts, 'missing-id')).toBeNull();
  });
});
