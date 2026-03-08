import { Injectable,
    NotFoundException,
  BadRequestException,
  InternalServerErrorException, } from '@nestjs/common';

  import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      return await this.prisma.product.create({
        data: createProductDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un producto con ese nombre');
        }
      }
      throw new InternalServerErrorException('Error al crear el producto');
    }
  }

  async findAll(query: QueryProductDto): Promise<Product[]> {
    const { isActive, search } = query;

    const where: Prisma.ProductWhereInput = {
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    return await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id); // Verificar que existe

    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateProductDto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('Ya existe un producto con ese nombre');
        }
        if (error.code === 'P2025') {
          throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
      }
      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: string): Promise<Product> {
    await this.findOne(id); // Verificar que existe

    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Producto con ID ${id} no encontrado`);
        }
      }
      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }

  async softDelete(id: string): Promise<Product> {
    return await this.update(id, { isActive: false });
  }

  async restore(id: string): Promise<Product> {
    return await this.update(id, { isActive: true });
  }

  async count(): Promise<number> {
    return await this.prisma.product.count({
      where: { isActive: true },
    });
  }
}
