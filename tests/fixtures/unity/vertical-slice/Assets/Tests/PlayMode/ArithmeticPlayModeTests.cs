using System.Collections;
using NUnit.Framework;
using UnityEngine.TestTools;

namespace Dreamy.Toolkit.Fixture.Tests
{
    public sealed class ArithmeticPlayModeTests
    {
        [UnityTest]
        public IEnumerator Add_ReturnsSumInPlayerLoop()
        {
            yield return null;
            Assert.That(Arithmetic.Add(19, 23), Is.EqualTo(42));
        }
    }
}
