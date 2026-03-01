import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from './clients.schema';
import { CreateClientDto } from './dto/create-client.dto';
import { PatchClientDto } from './dto/patch-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name)
    private readonly clientModel: Model<ClientDocument>,
  ) {}

  async create(dto: CreateClientDto): Promise<ClientDocument> {
    const created = new this.clientModel(dto);
    return created.save();
  }

  async findAll(): Promise<ClientDocument[]> {
    return this.clientModel.find().sort({ created_at: -1 }).exec();
  }

  async findOne(id: string): Promise<ClientDocument> {
    const found = await this.clientModel.findById(id).exec();
    if (!found) throw new NotFoundException('Client not found');
    return found;
  }

  async replace(id: string, dto: PatchClientDto): Promise<ClientDocument> {
    const updated = await this.clientModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException('Client not found');
    return updated;
  }

  async update(id: string, dto: UpdateClientDto): Promise<ClientDocument> {
    const updated = await this.clientModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();
    if (!updated) throw new NotFoundException('Client not found');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.clientModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Client not found');
  }
}
