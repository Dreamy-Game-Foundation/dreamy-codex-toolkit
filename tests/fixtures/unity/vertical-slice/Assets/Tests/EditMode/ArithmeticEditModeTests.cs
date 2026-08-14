using NUnit.Framework;

namespace Dreamy.Toolkit.Fixture.Tests
{
    public sealed class ArithmeticEditModeTests
    {
        [Test]
        public void Add_ReturnsSum()
        {
            Assert.That(Arithmetic.Add(20, 22), Is.EqualTo(42));
        }
    }
}
