/// <reference types="node" />
import test, { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { GetClientFormulasUseCase, SaveHairFormulaUseCase } from '../../src/application/use-cases/hair-formulas.use-cases';
import { IHairFormulaRepository } from '../../src/domain/ports/hair-formula-repository.port';
import { IClientRepository } from '../../src/domain/ports/client-repository.port';
import { HairFormula } from '../../src/domain/models/hair-formula.entity';
import { Client } from '../../src/domain/models/client.entity';
import { MoroccanPhoneNumber } from '../../src/domain/value-objects/phone-number.vo';

describe('HairFormulasUseCases', () => {
  let getFormulasUseCase: GetClientFormulasUseCase;
  let saveFormulaUseCase: SaveHairFormulaUseCase;
  let mockFormulaRepo: unknown;
  let mockClientRepo: unknown;

  const mockClient = new Client({
    id: 'client-1',
    branchId: 'branch-1',
    fullName: 'Test Client',
    phone: MoroccanPhoneNumber.create('0612345678')
  });

  const mockFormula = new HairFormula({
    id: 'formula-1',
    clientId: 'client-1',
    stylistId: 'stylist-1',
    visitDate: new Date('2026-01-01T10:00:00Z'),
    brand: 'Loreal',
    shadeFormula: '7.1 + 8.1',
    developerVolume: '20 Vol',
    processingTimeMinutes: 45,
    scalpAlert: 'Sensible aux démangeaisons'
  });

  beforeEach(() => {
    mockFormulaRepo = {
      findByClientId: async (clientId: string) => {
        if (clientId === 'client-1') return [mockFormula];
        return [];
      },
      save: async (formula: HairFormula) => formula,
    };

    mockClientRepo = {
      findById: async (id: string) => {
        if (id === 'client-1') return mockClient;
        return null;
      }
    };

    getFormulasUseCase = new GetClientFormulasUseCase(
      mockFormulaRepo as IHairFormulaRepository,
      mockClientRepo as IClientRepository
    );

    saveFormulaUseCase = new SaveHairFormulaUseCase(
      mockFormulaRepo as IHairFormulaRepository,
      mockClientRepo as IClientRepository
    );
  });

  describe('GetClientFormulasUseCase', () => {
    it('should retrieve past client formulas ordered by visit date', async () => {
      const start = performance.now();
      const result = await getFormulasUseCase.execute('client-1');
      const end = performance.now();
      
      assert.equal(result.length, 1);
      assert.equal(result[0].brand, 'Loreal');
      assert.equal(result[0].shadeFormula, '7.1 + 8.1');
      assert.equal(result[0].scalpAlert, 'Sensible aux démangeaisons');
      
      // Performance check < 50ms
      assert.ok((end - start) < 50, 'Execution time should be under 50ms');
    });

    it('should throw EntityNotFoundException if client does not exist', async () => {
      try {
        await getFormulasUseCase.execute('unknown-client');
        assert.fail('Should have thrown EntityNotFoundException');
      } catch (err: any) {
        assert.equal(err.name, 'EntityNotFoundException');
      }
    });
  });

  describe('SaveHairFormulaUseCase', () => {
    it('should save a new hair formula successfully', async () => {
      const result = await saveFormulaUseCase.execute({
        clientId: 'client-1',
        stylistId: 'stylist-2',
        brand: 'Wella',
        shadeFormula: '6/0',
        developerVolume: '10 Vol',
        processingTimeMinutes: 30,
        scalpAlert: 'Aucun'
      });

      assert.ok(result.id);
      assert.equal(result.clientId, 'client-1');
      assert.equal(result.brand, 'Wella');
      assert.equal(result.scalpAlert, 'Aucun');
    });

    it('should throw EntityNotFoundException if client does not exist when saving', async () => {
      try {
        await saveFormulaUseCase.execute({
          clientId: 'unknown-client',
          stylistId: 'stylist-2',
          brand: 'Wella',
          shadeFormula: '6/0',
          developerVolume: '10 Vol',
          processingTimeMinutes: 30
        });
        assert.fail('Should have thrown EntityNotFoundException');
      } catch (err: any) {
        assert.equal(err.name, 'EntityNotFoundException');
      }
    });
  });
});
