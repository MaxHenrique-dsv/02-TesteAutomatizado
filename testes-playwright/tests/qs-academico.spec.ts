import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://maxhenrique-dsv.github.io/02-TesteAutomatizado/');
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.locator('#tabela-alunos tbody').getByText('João Silva')).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve cadastrar 3 alunos consecutivos e a tabela deve ter 3 linhas', async ({ page }) => {
      const alunos = [
        { nome: 'Aluno Um',   n1: '7', n2: '8', n3: '9' },
        { nome: 'Aluno Dois', n1: '5', n2: '6', n3: '4' },
        { nome: 'Aluno Três', n1: '3', n2: '2', n3: '1' },
      ];

      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno.nome);
        await page.getByLabel('Nota 1').fill(aluno.n1);
        await page.getByLabel('Nota 2').fill(aluno.n2);
        await page.getByLabel('Nota 3').fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.0
      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

  // ========== GRUPO 3: Validação de Notas ==========

  test.describe('Validação de Notas', () => {

    test('deve rejeitar nota maior que 10', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Inválido');
      await page.getByLabel('Nota 1').fill('11');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

    test('deve rejeitar nota negativa', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Nota Negativa');
      await page.getByLabel('Nota 1').fill('-1');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 4: Busca por Nome ==========

  test('deve exibir apenas o aluno correspondente ao termo buscado', async ({ page }) => {
    for (const nome of ['Carlos Menezes', 'Fernanda Lima']) {
      await page.getByLabel('Nome do Aluno').fill(nome);
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('7');
      await page.getByLabel('Nota 3').fill('7');
      await page.getByRole('button', { name: 'Cadastrar' }).click();
    }
  
    await page.locator('#busca').fill('Carlos');
  
    await expect(page.locator('#tabela-alunos tbody').getByText('Carlos Menezes')).toBeVisible();
    await expect(page.locator('#tabela-alunos tbody').getByText('Fernanda Lima')).not.toBeVisible();
  });

  // ========== GRUPO 5: Exclusão ==========

  test.describe('Exclusão de Aluno', () => {

    test('deve remover o aluno e a tabela deve ficar vazia', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno para Excluir');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');
      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);

      await page.locator('#tabela-alunos tbody tr').first()
        .getByRole('button', { name: 'Excluir' }).click();

      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 6: Situação do Aluno ==========

  test.describe('Situação do Aluno', () => {

    test('deve exibir "Aprovado" para média ≥ 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Aprovado');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('9');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (7 + 8 + 9) / 3 = 8.00 → Aprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Aprovado');
    });

    test('deve exibir "Recuperação" para média ≥ 5 e < 7', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Recuperação');
      await page.getByLabel('Nota 1').fill('5');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (5 + 6 + 6) / 3 = 5.67 → Recuperação
      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Recuperação');
    });

    test('deve exibir "Reprovado" para média < 5', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Aluno Reprovado');
      await page.getByLabel('Nota 1').fill('3');
      await page.getByLabel('Nota 2').fill('2');
      await page.getByLabel('Nota 3').fill('4');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média: (3 + 2 + 4) / 3 = 3.00 → Reprovado
      const celulaSituacao = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(5);
      await expect(celulaSituacao).toHaveText('Reprovado');
    });

  });

  // ========== GRUPO 7: Estatísticas ==========

  test.describe('Estatísticas', () => {

    test('deve exibir totais corretos nos cards com alunos de situações distintas', async ({ page }) => {
      const alunos = [
        { nome: 'Aprovado Teste',    n1: '8', n2: '9', n3: '7' }, // média 8.00 → Aprovado
        { nome: 'Recuperação Teste', n1: '5', n2: '6', n3: '5' }, // média 5.33 → Recuperação
        { nome: 'Reprovado Teste',   n1: '2', n2: '3', n3: '1' }, // média 2.00 → Reprovado
      ];

      for (const aluno of alunos) {
        await page.getByLabel('Nome do Aluno').fill(aluno.nome);
        await page.getByLabel('Nota 1').fill(aluno.n1);
        await page.getByLabel('Nota 2').fill(aluno.n2);
        await page.getByLabel('Nota 3').fill(aluno.n3);
        await page.getByRole('button', { name: 'Cadastrar' }).click();
      }

      await expect(page.locator('#stat-aprovados')).toHaveText('1');
      await expect(page.locator('#stat-recuperacao')).toHaveText('1');
      await expect(page.locator('#stat-reprovados')).toHaveText('1');
    });

  });

});