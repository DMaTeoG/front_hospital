export async function GET() {
  const content = 'PDF ficticio de citas médicas';
  return new Response(content, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="appointments.pdf"',
    },
  });
}
