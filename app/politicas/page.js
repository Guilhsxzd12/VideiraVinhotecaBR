'use client';
import { usePathname } from 'next/navigation';
import PolicyLayout from './PolicyLayout';

const policies={
 privacidade:{title:'Política de Privacidade',intro:'Esta página explica como a Videira Vinhoteca trata informações fornecidas pelos clientes durante o uso do site e o atendimento comercial.',sections:[
  ['Informações coletadas','Podemos receber dados informados voluntariamente pelo cliente, como nome, telefone, preferências de compra e informações necessárias para atendimento e orçamento.'],
  ['Uso das informações','Os dados são utilizados para responder solicitações, organizar pedidos, prestar suporte e melhorar a experiência de atendimento.'],
  ['Compartilhamento','A Videira Vinhoteca não comercializa dados pessoais. Informações podem ser compartilhadas apenas quando necessárias para operação, entrega, pagamento ou cumprimento de obrigação legal.'],
  ['Contato','Dúvidas sobre privacidade podem ser encaminhadas pelo WhatsApp oficial da Videira Vinhoteca.']
 ]},
 trocas:{title:'Trocas e Devoluções',intro:'As condições abaixo organizam o processo de solicitação de troca ou devolução de produtos adquiridos com a Videira Vinhoteca.',sections:[
  ['Solicitação','Entre em contato pelo WhatsApp informando o pedido, o produto e o motivo da solicitação.'],
  ['Produto recebido com problema','Se houver avaria, divergência ou outro problema perceptível no recebimento, envie fotos e detalhes para análise do atendimento.'],
  ['Condições do produto','A análise pode considerar o estado da embalagem, lacres, conservação e demais condições do produto recebido.'],
  ['Prazos e solução','O prazo e a forma de solução serão informados após a análise de cada caso, observando a legislação aplicável.']
 ]},
 termos:{title:'Termos de Uso',intro:'Ao navegar neste site, o usuário concorda em utilizar seus recursos de forma lícita e compatível com a finalidade de catálogo e atendimento da Videira Vinhoteca.',sections:[
  ['Maioridade','A venda e o consumo de bebidas alcoólicas são destinados exclusivamente a maiores de 18 anos.'],
  ['Informações do catálogo','Preços, disponibilidade, safras, imagens e descrições podem ser atualizados sem aviso prévio e devem ser confirmados no momento do pedido.'],
  ['Pedidos e orçamento','O carrinho funciona como uma seleção de itens. A confirmação comercial, disponibilidade e condições finais são realizadas pelo atendimento da Videira Vinhoteca.'],
  ['Propriedade do conteúdo','Textos, identidade visual e demais conteúdos do site não devem ser reproduzidos sem autorização quando protegidos por direitos aplicáveis.']
 ]}
};

export default function PoliciesPage(){
 const pathname=usePathname();
 const slug=(pathname||'').split('/').filter(Boolean).pop()||'termos';
 const policy=policies[slug]||policies.termos;
 return <PolicyLayout title={policy.title} intro={policy.intro} sections={policy.sections}/>;
}
