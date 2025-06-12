# ⚖️ Regras de Negócio (RN)

| ID   | Descrição                                                                 |
|------|---------------------------------------------------------------------------|
| RNI  | A loja funciona das 07:50h às 18:00h.                                     |
| RN2  | Métodos de pagamento: Pix, Cartão de crédito/débito e dinheiro físico.   |
| RN3  | Reembolsos devem ser feitos fisicamente na loja.                         |
| RN4  | Entregas só são feitas em até 3 km do estabelecimento.                   |
| RNS  | Proibido vender fiado.                                                   |
| RN6  | Pode ocorrer troca de rações pelo preço apresentado.                     |

# 📋 Requisitos Funcionais (RF)

| ID   | Descrição                                                                                          |
|------|-----------------------------------------------------------------------------------------------------|
| RF1  | Função Cadastro de Produtos (ID Produto, Preço, Nome, Descrição, Categoria, Quantidade).           |
| RF2  | Função Cadastro de Usuário (CPF, Nome, Senha, E-mail, Telefone, Endereço, Tipo).                   |
| RF3  | Permitir que usuários com cargo de Funcionário editem dados dos produtos.                          |
| RF4  | Função Cadastro de Pedido (ID Pedido, CPF Cliente, Total, Forma de Pagamento, Estado).             |
| RF5  | Permitir que funcionários modifiquem o estado de um pedido.                                        |
| RF6  | Função Cadastro de Carrinho (ID Pedido, ID Produto, Quantidade).                                   |
| RF7  | Permitir que clientes façam pedidos de entrega pelo sistema.                                       |
| RF8  | Reduzir a quantidade do estoque quando um produto é adicionado ao carrinho vinculado a um pedido. |
| RF9  | Funcionários devem visualizar todos os pedidos.                                                    |
| RF10 | Os pedidos devem ser exibidos na ordem em que foram registrados.                                   |
| RF11 | O sistema deve notificar o cliente quando o entregador sair para entrega.                          |
| RF12 | Os clientes podem escolher pagar pelo sistema (Pix, Cartão).                                       |
| RF13 | O sistema deve exibir um catálogo de produtos.                                                     |
| RF14 | O cliente deve informar a forma de pagamento no pedido.                                            |

# ⚙️ Requisitos Não Funcionais (RNF)

| ID     | Descrição                                                                                      | Prioridade |
|--------|-----------------------------------------------------------------------------------------------|------------|
| RNF15  | O sistema deve ser desenvolvido apenas para Web (desktop).                                    | Alta       |
| RNF16  | O sistema deve ter tempo máximo de resposta de até 5 segundos.                                | Média      |
| RNF17  | O controle de estoque será feito via Desktop.                                                 | Alta       |
| RNF18  | O sistema deve ser desenvolvido com JavaScript (Next.js - frontend e backend).                | Alta       |
| RNF19  | Banco de dados deve ser PostgreSQL.                                                           | Alta       |
| RNF20  | O sistema deve ser intuitivo.                                                                 | Alta       |
| RNF21  | Backup do banco de dados será feito automaticamente às 3h da manhã todos os dias.             | Alta       |
| RNF22  | O sistema deve ter boa usabilidade.                                                           | Alta       |
| RNF23  | O sistema deve seguir os padrões de design e identidade visual da loja.                       | Alta       |
